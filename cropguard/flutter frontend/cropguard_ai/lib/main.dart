import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:io';
import 'dart:convert';
import 'package:http/http.dart' as http;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CropGuard AI',
      theme: ThemeData(
        primarySwatch: Colors.green,
        useMaterial3: true,
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.grey[100],
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 16,
          ),
        ),
      ),
      home: const AuthScreen(),
    );
  }
}

// User Model
class User {
  final String name;
  final String email;

  User({required this.name, required this.email});
}

// Authentication Screen
class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool isLogin = true;

  void _toggleAuthMode() {
    setState(() {
      isLogin = !isLogin;
    });
  }

  void _navigateToHome(User user) {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => MainScreen(user: user)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: isLogin
          ? LoginPage(
              onToggle: _toggleAuthMode,
              onLoginSuccess: _navigateToHome,
            )
          : RegisterPage(
              onToggle: _toggleAuthMode,
              onRegisterSuccess: _navigateToHome,
            ),
    );
  }
}

// Login Page
class LoginPage extends StatefulWidget {
  final VoidCallback onToggle;
  final Function(User) onLoginSuccess;

  const LoginPage({
    super.key,
    required this.onToggle,
    required this.onLoginSuccess,
  });

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() {
    if (_formKey.currentState!.validate()) {
      User user = User(name: 'Farmer', email: _emailController.text);
      widget.onLoginSuccess(user);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Colors.green[700]!, Colors.green[400]!],
        ),
      ),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(height: MediaQuery.of(context).size.height * 0.1),
              // App Logo/Icon
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black26,
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Icon(
                  Icons.agriculture,
                  size: 60,
                  color: Colors.green[700],
                ),
              ),
              const SizedBox(height: 20),
              // App Name
              const Text(
                'CropGuard AI',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 5),
              const Text(
                'Smart Farming Solution',
                style: TextStyle(fontSize: 14, color: Colors.white70),
              ),
              const SizedBox(height: 50),
              // Login Form
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    // Email Field
                    TextFormField(
                      controller: _emailController,
                      decoration: InputDecoration(
                        hintText: 'Email Address',
                        prefixIcon: const Icon(Icons.email),
                        prefixIconColor: Colors.green[700],
                      ),
                      keyboardType: TextInputType.emailAddress,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your email';
                        }
                        if (!value.contains('@')) {
                          return 'Please enter a valid email';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    // Password Field
                    TextFormField(
                      controller: _passwordController,
                      decoration: InputDecoration(
                        hintText: 'Password',
                        prefixIcon: const Icon(Icons.lock),
                        prefixIconColor: Colors.green[700],
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_off
                                : Icons.visibility,
                            color: Colors.green[700],
                          ),
                          onPressed: () {
                            setState(() {
                              _obscurePassword = !_obscurePassword;
                            });
                          },
                        ),
                      ),
                      obscureText: _obscurePassword,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your password';
                        }
                        if (value.length < 6) {
                          return 'Password must be at least 6 characters';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),
                    // Login Button
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Colors.green[700],
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: _handleLogin,
                        child: const Text(
                          'Login',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              // Don't have account
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    "Don't have an account? ",
                    style: TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                  GestureDetector(
                    onTap: widget.onToggle,
                    child: const Text(
                      'Register',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }
}

// Registration Page
class RegisterPage extends StatefulWidget {
  final VoidCallback onToggle;
  final Function(User) onRegisterSuccess;

  const RegisterPage({
    super.key,
    required this.onToggle,
    required this.onRegisterSuccess,
  });

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _handleRegister() {
    if (_formKey.currentState!.validate()) {
      User user = User(
        name: _nameController.text,
        email: _emailController.text,
      );
      widget.onRegisterSuccess(user);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Colors.green[700]!, Colors.green[400]!],
        ),
      ),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(height: MediaQuery.of(context).size.height * 0.05),
              // App Logo/Icon
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black26,
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Icon(
                  Icons.agriculture,
                  size: 45,
                  color: Colors.green[700],
                ),
              ),
              const SizedBox(height: 15),
              // App Name
              const Text(
                'CropGuard AI',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 5),
              const Text(
                'Create Your Farming Account',
                style: TextStyle(fontSize: 14, color: Colors.white70),
              ),
              const SizedBox(height: 30),
              // Registration Form
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    // Name Field
                    TextFormField(
                      controller: _nameController,
                      decoration: InputDecoration(
                        hintText: 'Full Name',
                        prefixIcon: const Icon(Icons.person),
                        prefixIconColor: Colors.green[700],
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your name';
                        }
                        if (value.length < 3) {
                          return 'Name must be at least 3 characters';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    // Email Field
                    TextFormField(
                      controller: _emailController,
                      decoration: InputDecoration(
                        hintText: 'Email Address',
                        prefixIcon: const Icon(Icons.email),
                        prefixIconColor: Colors.green[700],
                      ),
                      keyboardType: TextInputType.emailAddress,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your email';
                        }
                        if (!value.contains('@')) {
                          return 'Please enter a valid email';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    // Password Field
                    TextFormField(
                      controller: _passwordController,
                      decoration: InputDecoration(
                        hintText: 'Password',
                        prefixIcon: const Icon(Icons.lock),
                        prefixIconColor: Colors.green[700],
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_off
                                : Icons.visibility,
                            color: Colors.green[700],
                          ),
                          onPressed: () {
                            setState(() {
                              _obscurePassword = !_obscurePassword;
                            });
                          },
                        ),
                      ),
                      obscureText: _obscurePassword,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter a password';
                        }
                        if (value.length < 6) {
                          return 'Password must be at least 6 characters';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                    // Confirm Password Field
                    TextFormField(
                      controller: _confirmPasswordController,
                      decoration: InputDecoration(
                        hintText: 'Confirm Password',
                        prefixIcon: const Icon(Icons.lock),
                        prefixIconColor: Colors.green[700],
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscureConfirmPassword
                                ? Icons.visibility_off
                                : Icons.visibility,
                            color: Colors.green[700],
                          ),
                          onPressed: () {
                            setState(() {
                              _obscureConfirmPassword =
                                  !_obscureConfirmPassword;
                            });
                          },
                        ),
                      ),
                      obscureText: _obscureConfirmPassword,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please confirm your password';
                        }
                        if (value != _passwordController.text) {
                          return 'Passwords do not match';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),
                    // Register Button
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Colors.green[700],
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: _handleRegister,
                        child: const Text(
                          'Create Account',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Already have account
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    'Already have an account? ',
                    style: TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                  GestureDetector(
                    onTap: widget.onToggle,
                    child: const Text(
                      'Login',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

// Main App Screen
class MainScreen extends StatefulWidget {
  final User user;

  const MainScreen({super.key, required this.user});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  final List<LocationData> _data = [];

  final List<String> _messages = [];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  void _uploadImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      // Show loading dialog
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext dialogContext) {
          return const AlertDialog(
            content: Row(
              children: [
                CircularProgressIndicator(),
                SizedBox(width: 20),
                Expanded(child: Text("Analyzing Image with AI...")),
              ],
            ),
          );
        },
      );

      Disease? disease;

      try {
        final bytes = await File(image.path).readAsBytes();
        final base64Image = base64Encode(bytes);

        final url = Uri.parse('http://192.168.18.242:11434/api/generate');
        final response = await http.post(
          url,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            "model": "gemma4",
            "prompt": "You are an expert Plant Pathologist.\n\nAnalyze the following image for crop diseases.\n\nRespond ONLY in JSON format:\n{\n  \"disease\": \"\",\n  \"confidence\": 0.0,\n  \"severity\": \"\",\n  \"treatment\": \"\",\n  \"chemical\": \"\",\n  \"dosage\": \"\",\n  \"application_timing\": \"\",\n  \"prevention\": \"\",\n  \"spread_risk\": \"\",\n  \"symptoms\": [\"\"],\n  \"next_steps\": [\"\"]\n}\n\nKeep responses short and practical. Return ONLY valid JSON. No explanation, no extra text.",
            "images": [base64Image],
            "stream": false
          }),
        );

        if (response.statusCode == 200) {
          final jsonResponse = jsonDecode(response.body);
          final responseText = jsonResponse['response'] as String;
          
          final jsonStart = responseText.indexOf('{');
          final jsonEnd = responseText.lastIndexOf('}') + 1;
          
          if (jsonStart != -1 && jsonEnd != -1) {
            final parsedData = jsonDecode(responseText.substring(jsonStart, jsonEnd));
            disease = Disease(
              name: parsedData['disease']?.toString() ?? 'Unknown Disease',
              treatment: parsedData['treatment']?.toString() ?? 'No treatment specified',
              chemical: parsedData['chemical']?.toString() ?? 'No chemical specified',
              dosage: parsedData['dosage']?.toString() ?? 'No dosage specified',
              timing: parsedData['application_timing']?.toString() ?? 'No timing specified',
              confidence: (parsedData['confidence'] is num) ? parsedData['confidence'].toDouble() : 0.0,
              severity: parsedData['severity']?.toString() ?? 'Unknown',
              prevention: parsedData['prevention']?.toString() ?? 'No prevention specified',
              spreadRisk: parsedData['spread_risk']?.toString() ?? 'Unknown',
              symptoms: parsedData['symptoms'] != null ? List<String>.from(parsedData['symptoms']) : [],
              nextSteps: parsedData['next_steps'] != null ? List<String>.from(parsedData['next_steps']) : [],
            );
          }
        }
      } catch (e) {
        debugPrint("API Error: $e");
      }

      // Close the dialog
      if (mounted) Navigator.pop(context);

      if (disease == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to analyze image.')));
        }
        return;
      }

      // Fetch location to map it dynamically
      double lat = 19.0760;
      double lng = 72.8777;
      
      try {
        bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
        if (serviceEnabled) {
          LocationPermission permission = await Geolocator.checkPermission();
          if (permission == LocationPermission.denied) {
            permission = await Geolocator.requestPermission();
          }
          if (permission == LocationPermission.whileInUse || permission == LocationPermission.always) {
            Position position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.medium);
            lat = position.latitude;
            lng = position.longitude;
          }
        }
      } catch (locErr) {
        debugPrint("Location err: $locErr");
      }

      setState(() {
        _data.add(LocationData(lat, lng, 'My Farm', disease!.name));
      });

      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => AnalysisScreen(
              imagePath: image.path,
              disease: disease!,
              onChat: _addMessage,
            ),
          ),
        );
      }
    }
  }

  void _addMessage(String message) {
    setState(() {
      _messages.add('Farmer: $message');
      _messages.add('Bot is typing...');
    });

    Future.delayed(const Duration(seconds: 1), () {
      if (!mounted) return;
      setState(() {
        _messages.removeLast(); // Remove 'Bot is typing...'
        String botReply =
            "I'm still learning about farming. Could you provide a clearer photo or more details?";
        String lowerMsg = message.toLowerCase();
        if (lowerMsg.contains('water') || lowerMsg.contains('irrigation')) {
          botReply =
              "For current conditions, water your crops early morning to reduce evaporation and fungal diseases.";
        } else if (lowerMsg.contains('rust') ||
            lowerMsg.contains('blight') ||
            lowerMsg.contains('mildew')) {
          botReply =
              "This looks like a fungal infection. Please check the Treatment Plan section for exact fungicide dosage.";
        } else if (lowerMsg.contains('hello') || lowerMsg.contains('hi')) {
          botReply =
              "Hello! I am CropGuard AI. How can I help you with your crops today?";
        } else if (lowerMsg.contains('fertilizer') ||
            lowerMsg.contains('npk')) {
          botReply =
              "Based on general needs, a balanced NPK fertilizer works best. Ensure soil testing before application.";
        }
        _messages.add('Bot: $botReply');
      });
    });
  }

  void _logout() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const AuthScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    List<Widget> widgetOptions = <Widget>[
      HomeScreen(onUpload: _uploadImage, onNavigate: _onItemTapped, data: _data),
      HeatmapScreen(data: _data),
      GraphScreen(data: _data),
      ChatScreen(messages: _messages, onSend: _addMessage),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('CropGuard AI'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: PopupMenuButton(
              itemBuilder: (context) => [
                PopupMenuItem(
                  child: const Text('Profile'),
                  onTap: () => _showProfileDialog(),
                ),
                PopupMenuItem(child: const Text('Logout'), onTap: _logout),
              ],
            ),
          ),
        ],
      ),
      body: widgetOptions.elementAt(_selectedIndex),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        unselectedItemColor: Colors.grey,
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.map), label: 'Heatmap'),
          BottomNavigationBarItem(icon: Icon(Icons.bar_chart), label: 'Graphs'),
          BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Chat'),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.green,
        onTap: _onItemTapped,
      ),
    );
  }

  void _showProfileDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Profile'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Name: ${widget.user.name}'),
            const SizedBox(height: 10),
            Text('Email: ${widget.user.email}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}

// Models
class Disease {
  final String name;
  final String treatment;
  final String chemical;
  final String dosage;
  final String timing;
  final double confidence;
  final String severity;
  final String prevention;
  final String spreadRisk;
  final List<String> symptoms;
  final List<String> nextSteps;

  Disease({
    required this.name,
    required this.treatment,
    required this.chemical,
    required this.dosage,
    required this.timing,
    required this.confidence,
    required this.severity,
    required this.prevention,
    required this.spreadRisk,
    required this.symptoms,
    required this.nextSteps,
  });
}

class LocationData {
  final double lat;
  final double lng;
  final String taluka;
  final String disease;

  LocationData(this.lat, this.lng, this.taluka, this.disease);
}

class HomeScreen extends StatelessWidget {
  final VoidCallback onUpload;
  final Function(int) onNavigate;
  final List<LocationData> data;

  const HomeScreen({
    super.key,
    required this.onUpload,
    required this.onNavigate,
    required this.data,
  });

  @override
  Widget build(BuildContext context) {
    int totalCrops = data.length;
    int diseaseCount = data.where((d) => d.disease.toLowerCase() != 'healthy' && d.disease.toLowerCase() != 'none').length;
    int healthyCount = totalCrops - diseaseCount;
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Header
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.green[600]!, Colors.green[400]!],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Icon(Icons.sunny, size: 50, color: Colors.white),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Good Morning, Farmer!',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Your crops are healthy today',
                          style: TextStyle(fontSize: 14, color: Colors.white70),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Quick Stats
            const Text(
              'Quick Stats',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _StatCard(
                    icon: Icons.grass,
                    label: 'Total Crops',
                    value: totalCrops.toString(),
                    color: Colors.green,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _StatCard(
                    icon: Icons.warning,
                    label: 'Diseases',
                    value: diseaseCount.toString(),
                    color: Colors.orange,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _StatCard(
                    icon: Icons.check_circle,
                    label: 'Healthy',
                    value: healthyCount.toString(),
                    color: Colors.green,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Main Action Card
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.green[500]!, Colors.teal[400]!],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.green.withOpacity(0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 5),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  Icon(Icons.camera_alt, size: 60, color: Colors.white),
                  const SizedBox(height: 12),
                  const Text(
                    'Upload Crop Photo',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Scan your crops for disease detection',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, color: Colors.white70),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.green[600],
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: onUpload,
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.upload),
                          SizedBox(width: 8),
                          Text(
                            'Choose Image',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Features Section
            const Text(
              'Features',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _FeatureCard(
              icon: Icons.map,
              title: 'Disease Heatmap',
              description: 'View diseases in your region',
              onTap: () => onNavigate(1),
            ),
            const SizedBox(height: 10),
            _FeatureCard(
              icon: Icons.bar_chart,
              title: 'Analytics',
              description: 'Check historical crop data',
              onTap: () => onNavigate(2),
            ),
            const SizedBox(height: 10),
            _FeatureCard(
              icon: Icons.chat,
              title: 'AI Chatbot',
              description: 'Ask farming questions',
              onTap: () => onNavigate(3),
            ),
            const SizedBox(height: 24),

            // Tips Section
            Container(
              decoration: BoxDecoration(
                color: Colors.amber[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.amber[300]!, width: 1),
              ),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.lightbulb, color: Colors.amber[700]),
                      const SizedBox(width: 8),
                      const Text(
                        'Daily Tip',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Water your crops early in the morning to reduce disease risk and maximize water absorption.',
                    style: TextStyle(fontSize: 12, color: Colors.grey[700]),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

// Stat Card Widget
class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 10, color: Colors.grey[600]),
          ),
        ],
      ),
    );
  }
}

// Feature Card Widget
class _FeatureCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final VoidCallback onTap;

  const _FeatureCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.grey[50],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey[200]!),
        ),
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: Colors.green[100],
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: Colors.green[600]),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    description,
                    style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward, color: Colors.grey[400]),
          ],
        ),
      ),
    );
  }
}

class AnalysisScreen extends StatelessWidget {
  final String imagePath;
  final Disease disease;
  final Function(String) onChat;

  const AnalysisScreen({
    super.key,
    required this.imagePath,
    required this.disease,
    required this.onChat,
  });

  Color _getSeverityColor() {
    switch (disease.severity.toLowerCase()) {
      case 'low':
        return Colors.green;
      case 'high':
        return Colors.red;
      case 'medium':
      default:
        return Colors.amber;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Disease Analysis'), elevation: 0),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Section
            AspectRatio(
              aspectRatio: 4 / 3,
              child: Image.file(
                File(imagePath),
                fit: BoxFit.cover,
                width: double.infinity,
              ),
            ),
            const SizedBox(height: 20),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Disease + Confidence + Severity
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          disease.name,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: _getSeverityColor().withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: _getSeverityColor()),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.circle, color: _getSeverityColor(), size: 12),
                            const SizedBox(width: 6),
                            Text(
                              disease.severity.toUpperCase(),
                              style: TextStyle(
                                color: _getSeverityColor(),
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  
                  // Confidence Bar
                  const Text('AI Confidence', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: LinearProgressIndicator(
                            value: disease.confidence,
                            backgroundColor: Colors.grey[200],
                            color: disease.confidence > 0.8 ? Colors.green : (disease.confidence > 0.5 ? Colors.amber : Colors.red),
                            minHeight: 10,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        '${(disease.confidence * 100).toStringAsFixed(0)}%',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Treatment Information
                  const Text('Treatment Plan', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  _TreatmentCard(icon: Icons.medical_services, title: 'Treatment', description: disease.treatment, color: Colors.blue),
                  const SizedBox(height: 10),
                  _TreatmentCard(icon: Icons.science, title: 'Chemical Solution', description: disease.chemical, color: Colors.purple),
                  const SizedBox(height: 10),
                  _TreatmentCard(icon: Icons.scale, title: 'Dosage', description: disease.dosage, color: Colors.green),
                  const SizedBox(height: 10),
                  _TreatmentCard(icon: Icons.schedule, title: 'Application Timing', description: disease.timing, color: Colors.orange),
                  const SizedBox(height: 24),

                  // Why this diagnosis?
                  if (disease.symptoms.isNotEmpty) ...[
                    const Text('Why this diagnosis?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: disease.symptoms.map((symptom) => Chip(
                        label: Text(symptom, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        backgroundColor: Colors.red[50],
                        side: BorderSide(color: Colors.red[200]!),
                      )).toList(),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Risk Level
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.orange[50],
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.orange[200]!),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 28),
                        const SizedBox(width: 12),
                        const Text('Spread Risk: ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text(disease.spreadRisk, style: const TextStyle(fontSize: 16, color: Colors.orange, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Next Steps
                  if (disease.nextSteps.isNotEmpty) ...[
                    const Text('Next Steps', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                     const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey[200]!),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: disease.nextSteps.map((step) => Padding(
                          padding: const EdgeInsets.only(bottom: 8.0),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.check_circle, color: Colors.green, size: 20),
                              const SizedBox(width: 8),
                              Expanded(child: Text(step, style: const TextStyle(fontSize: 14))),
                            ],
                          ),
                        )).toList(),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Prevention Tips
                  const Text('Prevention', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.blue[50],
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.blue[200]!),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.shield, color: Colors.blue, size: 28),
                        const SizedBox(width: 12),
                        Expanded(child: Text(disease.prevention, style: const TextStyle(fontSize: 14))),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Ask Chatbot Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green[600],
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        Navigator.push(context, MaterialPageRoute(builder: (context) => ChatScreen(messages: [], onSend: onChat)));
                      },
                      icon: const Icon(Icons.chat),
                      label: const Text('Ask AI Chatbot', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Go Back Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.green[600]!, width: 2),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(Icons.arrow_back, color: Colors.green[600]),
                      label: Text('Go Back', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.green[600])),
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  // Disclaimer
                  const Center(
                    child: Text(
                      'AI-based prediction. Verify with local expert.',
                      style: TextStyle(fontSize: 12, color: Colors.grey, fontStyle: FontStyle.italic),
                    ),
                  ),
                  const SizedBox(height: 30),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Treatment Card Widget
class _TreatmentCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final Color color;

  const _TreatmentCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      padding: const EdgeInsets.all(12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class HeatmapScreen extends StatefulWidget {
  final List<LocationData> data;

  const HeatmapScreen({super.key, required this.data});

  @override
  State<HeatmapScreen> createState() => _HeatmapScreenState();
}

class _HeatmapScreenState extends State<HeatmapScreen> {
  late GoogleMapController mapController;
  final Set<Marker> _markers = {};
  bool _locationPermissionGranted = false;

  @override
  void initState() {
    super.initState();
    _initMarkers();
    _determinePosition();
  }

  void _initMarkers() {
    for (var d in widget.data) {
      _markers.add(
        Marker(
          markerId: MarkerId('${d.lat}-${d.lng}'),
          position: LatLng(d.lat, d.lng),
          infoWindow: InfoWindow(title: d.disease, snippet: d.taluka),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        ),
      );
    }
  }

  Future<void> _determinePosition() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return;

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return;
    }

    if (permission == LocationPermission.deniedForever) return;

    Position position = await Geolocator.getCurrentPosition();
    if (mounted) {
      setState(() {
        _locationPermissionGranted = true;
      });
      mapController.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(
            target: LatLng(position.latitude, position.longitude),
            zoom: 11,
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return GoogleMap(
      onMapCreated: (GoogleMapController controller) {
        mapController = controller;
      },
      initialCameraPosition: const CameraPosition(
        target: LatLng(19.0760, 72.8777),
        zoom: 10,
      ),
      markers: _markers,
      myLocationEnabled: _locationPermissionGranted,
      myLocationButtonEnabled: _locationPermissionGranted,
    );
  }
}

class GraphScreen extends StatelessWidget {
  final List<LocationData> data;

  const GraphScreen({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    // Count diseases per location to estimate hotspots
    Map<String, int> countsByLocation = {};
    for (var d in data) {
      countsByLocation[d.taluka] = (countsByLocation[d.taluka] ?? 0) + 1;
    }

    List<String> locations = countsByLocation.keys.toList();
    List<FlSpot> spots = [];
    for (int i = 0; i < locations.length; i++) {
      spots.add(
        FlSpot(i.toDouble(), countsByLocation[locations[i]]!.toDouble()),
      );
    }

    List<Color> gradientColors = [
      Colors.deepOrange,
      Colors.orange,
      Colors.redAccent,
    ];

    double maxCases = countsByLocation.isEmpty
        ? 5.0
        : countsByLocation.values.reduce((a, b) => a > b ? a : b).toDouble() +
              2.0;

    return Scaffold(
      appBar: AppBar(title: const Text('Disease Hotspots Analysis')),
      body: Padding(
        padding: const EdgeInsets.only(
          right: 24.0,
          left: 16.0,
          top: 40.0,
          bottom: 20.0,
        ),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                blurRadius: 10,
                spreadRadius: 2,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Crop Issues per Location',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 30),
              Expanded(
                child: LineChart(
                  LineChartData(
                    gridData: FlGridData(
                      show: true,
                      drawVerticalLine: true,
                      horizontalInterval: 1,
                      verticalInterval: 1,
                      getDrawingHorizontalLine: (value) => FlLine(
                        color: Colors.grey.withOpacity(0.2),
                        strokeWidth: 1,
                      ),
                      getDrawingVerticalLine: (value) => FlLine(
                        color: Colors.grey.withOpacity(0.2),
                        strokeWidth: 1,
                      ),
                    ),
                    titlesData: FlTitlesData(
                      show: true,
                      rightTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false),
                      ),
                      topTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: false),
                      ),
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          reservedSize: 45,
                          interval: 1,
                          getTitlesWidget: (value, meta) {
                            if (value.toInt() >= 0 &&
                                value.toInt() < locations.length) {
                              return Padding(
                                padding: const EdgeInsets.only(top: 8.0),
                                child: Transform.rotate(
                                  angle: -0.5,
                                  child: Text(
                                    locations[value.toInt()],
                                    style: const TextStyle(
                                      color: Colors.black87,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              );
                            }
                            return const Text('');
                          },
                        ),
                      ),
                      leftTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          interval: 1,
                          reservedSize: 30,
                          getTitlesWidget: (value, meta) {
                            return Text(
                              value.toInt().toString(),
                              style: const TextStyle(
                                color: Colors.black87,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                    borderData: FlBorderData(
                      show: true,
                      border: Border.all(color: Colors.grey.withOpacity(0.3)),
                    ),
                    minX: 0,
                    maxX: locations.length > 1
                        ? (locations.length - 1).toDouble()
                        : 1.0,
                    minY: 0,
                    maxY: maxCases,
                    lineBarsData: [
                      LineChartBarData(
                        spots: locations.isEmpty ? [const FlSpot(0, 0)] : spots,
                        isCurved: true,
                        gradient: LinearGradient(colors: gradientColors),
                        barWidth: 4,
                        isStrokeCapRound: true,
                        dotData: FlDotData(
                          show: true,
                          getDotPainter: (spot, percent, barData, index) =>
                              FlDotCirclePainter(
                                radius: 6,
                                color: Colors.white,
                                strokeWidth: 3,
                                strokeColor: Colors.deepOrange,
                              ),
                        ),
                        belowBarData: BarAreaData(
                          show: true,
                          gradient: LinearGradient(
                            colors: gradientColors
                                .map((color) => color.withOpacity(0.3))
                                .toList(),
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                        ),
                      ),
                    ],
                    lineTouchData: LineTouchData(
                      touchTooltipData: LineTouchTooltipData(
                        tooltipBgColor: Colors.blueGrey[900]!,
                        getTooltipItems: (touchedSpots) {
                          return touchedSpots.map((LineBarSpot touchedSpot) {
                            final textWidget =
                                '${locations[touchedSpot.x.toInt()]}\n${touchedSpot.y.toInt()} Cases';
                            return LineTooltipItem(
                              textWidget,
                              const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            );
                          }).toList();
                        },
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ChatScreen extends StatefulWidget {
  final List<String> messages;
  final Function(String) onSend;

  const ChatScreen({super.key, required this.messages, required this.onSend});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _controller = TextEditingController();
  late ScrollController _scrollController;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    if (_controller.text.isNotEmpty) {
      widget.onSend(_controller.text);
      _controller.clear();
      Future.delayed(const Duration(milliseconds: 100), () {
        if (_scrollController.hasClients) {
          _scrollController.animateTo(
            _scrollController.position.maxScrollExtent,
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOut,
          );
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('CropGuard AI Assistant'), elevation: 0),
      body: Column(
        children: [
          // Initial Message
          if (widget.messages.isEmpty)
            Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: Colors.green[100],
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Icon(
                        Icons.agriculture,
                        size: 40,
                        color: Colors.green[600],
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Ask your farming questions',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'I am here to help you with crop disease management',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
            )
          else
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                itemCount: widget.messages.length,
                padding: const EdgeInsets.all(16),
                itemBuilder: (context, index) {
                  final message = widget.messages[index];
                  final isBot = message.startsWith('Bot:');
                  final text = message.replaceFirst(
                    isBot ? 'Bot: ' : 'Farmer: ',
                    '',
                  );

                  return Align(
                    alignment: isBot
                        ? Alignment.centerLeft
                        : Alignment.centerRight,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: isBot ? Colors.grey[200] : Colors.green[500],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        text,
                        style: TextStyle(
                          fontSize: 14,
                          color: isBot ? Colors.black87 : Colors.white,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          // Message Input Area
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.grey[200]!)),
            ),
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: InputDecoration(
                      hintText: 'Type your question...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: Colors.grey[100],
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      hintStyle: TextStyle(color: Colors.grey[500]),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.green[500],
                    borderRadius: BorderRadius.circular(50),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.send, color: Colors.white),
                    onPressed: _sendMessage,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
