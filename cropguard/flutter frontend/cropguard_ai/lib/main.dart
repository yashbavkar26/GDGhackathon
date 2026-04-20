import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:geolocator/geolocator.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:flutter_tts/flutter_tts.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'dart:io';
import 'dart:convert';
import 'dart:math' as math;
import 'package:http/http.dart' as http;

final ValueNotifier<ThemeMode> themeNotifier = ValueNotifier(ThemeMode.light);
final ValueNotifier<String> languageNotifier = ValueNotifier('English');

class CropAlertNotificationService {
  static final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();
  static bool _initialized = false;

  static Future<void> _ensureInitialized() async {
    if (_initialized) return;

    const androidSettings = AndroidInitializationSettings(
      '@mipmap/ic_launcher',
    );
    const iosSettings = DarwinInitializationSettings();

    const settings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _plugin.initialize(settings);

    try {
      await Permission.notification.request();
    } catch (_) {
      // Ignore unsupported platforms.
    }

    _initialized = true;
  }

  static Future<void> showPostAnalysisDummyAlert(Disease disease) async {
    await _ensureInitialized();

    const androidDetails = AndroidNotificationDetails(
      'cropguard_dummy_alerts',
      'CropGuard Alerts',
      channelDescription: 'Dummy crop alerts shown after AI analysis',
      importance: Importance.max,
      priority: Priority.high,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: DarwinNotificationDetails(),
    );

    final title = 'Crop Alert Demo: ${disease.name}';
    final body =
        'Analysis complete. Severity ${disease.severity.toUpperCase()}, '
        'spread risk ${disease.spreadRisk}.';

    await _plugin.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      body,
      details,
    );
  }
}

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ThemeMode>(
      valueListenable: themeNotifier,
      builder: (_, ThemeMode currentMode, __) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'CropGuard AI',
          themeMode: currentMode,
          theme: ThemeData(
            primarySwatch: Colors.green,
            brightness: Brightness.light,
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
          darkTheme: ThemeData(
            primarySwatch: Colors.green,
            brightness: Brightness.dark,
            useMaterial3: true,
          ),
          home: const AuthScreen(),
        );
      },
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
  static const String _ollamaBaseUrl = 'http://10.140.93.83:11434';
  static const String _ollamaModel = 'gemma4';
  static const String _dashboardSqlApiBaseUrl = 'http://10.140.93.83:5050';

  int _selectedIndex = 0;

  final List<LocationData> _data = [];

  final List<String> _messages = [];
  final List<ScanHistoryItem> _scanHistory = [];

  @override
  void initState() {
    super.initState();
    _loadPersistedScanResults();
  }

  Future<void> _loadPersistedScanResults() async {
    try {
      final response = await http.get(
        Uri.parse('$_dashboardSqlApiBaseUrl/api/results'),
      ).timeout(const Duration(seconds: 2));

      if (response.statusCode != 200) return;

      final decoded = jsonDecode(response.body);
      if (decoded is! Map<String, dynamic>) return;
      final items = decoded['items'];
      if (items is! List) return;

      final loadedHistory = items
          .whereType<Map<String, dynamic>>()
          .map(_scanHistoryItemFromJson)
          .toList();

      if (!mounted) return;
      setState(() {
        _scanHistory
          ..clear()
          ..addAll(loadedHistory);
        _data
          ..clear()
          ..addAll(
            loadedHistory.map(
              (entry) => LocationData(
                entry.lat,
                entry.lng,
                entry.locationLabel,
                entry.disease,
              ),
            ),
          );
      });
    } catch (_) {
      // Keep app functional if SQL API is offline.
    }
  }

  Future<void> _persistScanResultToSql(ScanHistoryItem item) async {
    final payload = {
      'imagePath': item.imagePath,
      'disease': item.disease,
      'severity': item.severity,
      'confidence': item.confidence,
      'locationLabel': item.locationLabel,
      'lat': item.lat,
      'lng': item.lng,
      'timestamp': item.timestamp.toIso8601String(),
      'diseaseDetails': {
        'name': item.diseaseDetails.name,
        'treatment': item.diseaseDetails.treatment,
        'chemical': item.diseaseDetails.chemical,
        'dosage': item.diseaseDetails.dosage,
        'timing': item.diseaseDetails.timing,
        'confidence': item.diseaseDetails.confidence,
        'severity': item.diseaseDetails.severity,
        'prevention': item.diseaseDetails.prevention,
        'spreadRisk': item.diseaseDetails.spreadRisk,
        'symptoms': item.diseaseDetails.symptoms,
        'nextSteps': item.diseaseDetails.nextSteps,
      },
    };

    try {
      await http.post(
        Uri.parse('$_dashboardSqlApiBaseUrl/api/results'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 2));
    } catch (_) {
      // Non-blocking persistence for demo flow.
    }
  }

  static double _toDouble(dynamic value, {double fallback = 0.0}) {
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? fallback;
    return fallback;
  }

  static List<String> _toStringList(dynamic value) {
    if (value is List) {
      return value.map((e) => e.toString()).toList();
    }
    return [];
  }

  ScanHistoryItem _scanHistoryItemFromJson(Map<String, dynamic> json) {
    final diseaseMap =
        (json['diseaseDetails'] as Map?)?.cast<String, dynamic>() ??
        <String, dynamic>{};

    final disease = Disease(
      name:
          diseaseMap['name']?.toString() ??
          json['disease']?.toString() ??
          'Unknown Disease',
      treatment:
          diseaseMap['treatment']?.toString() ?? 'No treatment specified',
      chemical: diseaseMap['chemical']?.toString() ?? 'No chemical specified',
      dosage: diseaseMap['dosage']?.toString() ?? 'No dosage specified',
      timing: diseaseMap['timing']?.toString() ?? 'No timing specified',
      confidence: _toDouble(
        diseaseMap['confidence'],
        fallback: _toDouble(json['confidence']),
      ),
      severity:
          diseaseMap['severity']?.toString() ??
          json['severity']?.toString() ??
          'Unknown',
      prevention:
          diseaseMap['prevention']?.toString() ?? 'No prevention specified',
      spreadRisk: diseaseMap['spreadRisk']?.toString() ?? 'Unknown',
      symptoms: _toStringList(diseaseMap['symptoms']),
      nextSteps: _toStringList(diseaseMap['nextSteps']),
    );

    return ScanHistoryItem(
      imagePath: json['imagePath']?.toString() ?? '',
      disease: json['disease']?.toString() ?? disease.name,
      severity: json['severity']?.toString() ?? disease.severity,
      confidence: _toDouble(json['confidence'], fallback: disease.confidence),
      diseaseDetails: disease,
      locationLabel: json['locationLabel']?.toString() ?? 'My Farm',
      lat: _toDouble(json['lat'], fallback: 19.0760),
      lng: _toDouble(json['lng'], fallback: 72.8777),
      timestamp:
          DateTime.tryParse(json['timestamp']?.toString() ?? '') ??
          DateTime.now(),
    );
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  Future<ImageSource?> _pickImageSource() async {
    return showModalBottomSheet<ImageSource>(
      context: context,
      builder: (ctx) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.camera_alt),
                title: const Text('Take Photo'),
                onTap: () => Navigator.of(ctx).pop(ImageSource.camera),
              ),
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('Choose from Gallery'),
                onTap: () => Navigator.of(ctx).pop(ImageSource.gallery),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<bool> _requestCameraPermission() async {
    final status = await Permission.camera.status;
    if (status.isGranted) return true;

    final result = await Permission.camera.request();
    if (result.isGranted) return true;

    if (!mounted) return false;
    if (result.isPermanentlyDenied) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Camera permission is permanently denied. Enable it from app settings.',
          ),
        ),
      );
      await openAppSettings();
      return false;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Camera permission is required to take photos.')),
    );
    return false;
  }

  void _uploadImage() async {
    final ImageSource? source = await _pickImageSource();
    if (source == null) return;

    if (source == ImageSource.camera) {
      final granted = await _requestCameraPermission();
      if (!granted) return;
    }

    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: source);
    if (image != null) {
      debugPrint("\n=======================================================");
      debugPrint("📷 [STEP 1] Image successfully selected by user! Path: ${image.path}");
      debugPrint("=======================================================\n");

      // Show loading dialog
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext dialogContext) {
          return AlertDialog(
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.file(
                      File(image.path),
                      width: 160,
                      height: 160,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Row(
                    children: [
                      CircularProgressIndicator(),
                      SizedBox(width: 16),
                      Expanded(child: Text("Analyzing image with AI...")),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      );

      Disease? disease;

      try {
        final bytes = await File(image.path).readAsBytes();
        final base64Image = base64Encode(bytes);
        debugPrint("✅ [STEP 2] Image converted directly into Base64 byte format.");

        final url = Uri.parse('$_ollamaBaseUrl/api/generate');
        debugPrint("🌐 [STEP 3] Preparing to ping the backend API endpoint at: $url");
        
        final response = await http.post(
          url,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            "model": _ollamaModel,
            "prompt":
                "You are an expert Plant Pathologist.\n\nAnalyze the following image for crop diseases.\n\nRespond ONLY in JSON format:\n{\n  \"disease\": \"\",\n  \"confidence\": 0.0,\n  \"severity\": \"\",\n  \"treatment\": \"\",\n  \"chemical\": \"\",\n  \"dosage\": \"\",\n  \"application_timing\": \"\",\n  \"prevention\": \"\",\n  \"spread_risk\": \"\",\n  \"symptoms\": [\"\"],\n  \"next_steps\": [\"\"]\n}\n\nKeep responses short and practical. Return ONLY valid JSON. No explanation, no extra text.",
            "images": [base64Image],
            "stream": false,
          }),
        );

        debugPrint("📥 [STEP 4] Received HTTP response from server! Status Code: ${response.statusCode}");

        if (response.statusCode == 200) {
          debugPrint("✅ [STEP 5] Success! Connection valid. Processing the LLM string response...");
          final jsonResponse = jsonDecode(response.body);
          final responseText = jsonResponse['response'] as String;

          final jsonStart = responseText.indexOf('{');
          final jsonEnd = responseText.lastIndexOf('}') + 1;

          if (jsonStart != -1 && jsonEnd != -1) {
            final parsedData = jsonDecode(
              responseText.substring(jsonStart, jsonEnd),
            );
            debugPrint("🟢 [STEP 6] JSON successfully parsed! Predicted Disease: ${parsedData['disease']}");

            disease = Disease(
              name: parsedData['disease']?.toString() ?? 'Unknown Disease',
              treatment:
                  parsedData['treatment']?.toString() ??
                  'No treatment specified',
              chemical:
                  parsedData['chemical']?.toString() ?? 'No chemical specified',
              dosage: parsedData['dosage']?.toString() ?? 'No dosage specified',
              timing:
                  parsedData['application_timing']?.toString() ??
                  'No timing specified',
              confidence: (parsedData['confidence'] is num)
                  ? parsedData['confidence'].toDouble()
                  : 0.0,
              severity: parsedData['severity']?.toString() ?? 'Unknown',
              prevention:
                  parsedData['prevention']?.toString() ??
                  'No prevention specified',
              spreadRisk: parsedData['spread_risk']?.toString() ?? 'Unknown',
              symptoms: parsedData['symptoms'] != null
                  ? List<String>.from(parsedData['symptoms'])
                  : [],
              nextSteps: parsedData['next_steps'] != null
                  ? List<String>.from(parsedData['next_steps'])
                  : [],
            );
          } else {
             debugPrint("🔴 [ERROR] Could not extract valid JSON brackets from the response!");
             debugPrint("Raw text from AI was: $responseText");
          }
        } else {
             debugPrint("🔴 [NETWORK ERROR] The server responded with an error, not 200 OK. Content: ${response.body}");
        }
      } catch (e) {
        debugPrint("\n❌ [CRITICAL FATAL API ERROR] The backend API ping completely failed!");
        debugPrint("Error output is: $e");
        debugPrint("Make sure your Python Ollama backend is running and OLLAMA_HOST is 0.0.0.0!\n");
      }


      // Close the dialog
      if (mounted) Navigator.pop(context);

      if (disease == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to analyze image.')),
          );
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
          if (permission == LocationPermission.whileInUse ||
              permission == LocationPermission.always) {
            Position position = await Geolocator.getCurrentPosition(
              desiredAccuracy: LocationAccuracy.medium,
            );
            lat = position.latitude;
            lng = position.longitude;
          }
        }
      } catch (locErr) {
        debugPrint("Location err: $locErr");
      }

      final newItem = ScanHistoryItem(
        imagePath: image.path,
        disease: disease!.name,
        severity: disease!.severity,
        confidence: disease!.confidence,
        diseaseDetails: disease!,
        locationLabel: 'My Farm',
        lat: lat,
        lng: lng,
        timestamp: DateTime.now(),
      );

      setState(() {
        _data.add(LocationData(lat, lng, 'My Farm', disease!.name));
        _scanHistory.insert(0, newItem);
      });

      await _persistScanResultToSql(newItem);

      try {
        await CropAlertNotificationService.showPostAnalysisDummyAlert(disease!);
      } catch (notificationError) {
        debugPrint('Notification error: $notificationError');
      }

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

  Future<void> _addMessage(String message) async {
    setState(() {
      _messages.add('Farmer: $message');
      _messages.add('Bot is typing...');
    });

    String botReply =
        "I'm still learning about farming. Could you provide a clearer photo or more details?";
    final lowerMsg = message.toLowerCase();
    const offTopicReply =
        'I can only help with farming and crop disease questions. Please ask about crops, pests, diseases, soil, irrigation, fertilizer, or markets.';

    final isFarmingQuestion = _isFarmingQuestion(lowerMsg);

    if (!isFarmingQuestion) {
      if (!mounted) return;
      setState(() {
        if (_messages.isNotEmpty && _messages.last == 'Bot is typing...') {
          _messages.removeLast();
        }
        _messages.add('Bot: $offTopicReply');
      });
      return;
    }

    try {
      final prompt =
          'You are CropGuard AI, an agricultural assistant for Indian farmers. '
          'Answer only farming and crop disease questions. Keep response short, practical, and safe.\n\n'
          'Farmer question: $message';

      final response = await http.post(
        Uri.parse('$_ollamaBaseUrl/api/generate'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          "model": _ollamaModel,
          "prompt": prompt,
          "stream": false,
        }),
      );

      if (response.statusCode == 200) {
        final jsonBody = jsonDecode(response.body);
        final modelText = jsonBody['response']?.toString().trim();
        if (modelText != null && modelText.isNotEmpty) {
          botReply = modelText;
        }
      } else {
        botReply = 'Local model is unavailable right now. Please try again.';
      }
    } catch (_) {
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
      } else if (lowerMsg.contains('fertilizer') || lowerMsg.contains('npk')) {
        botReply =
            "Based on general needs, a balanced NPK fertilizer works best. Ensure soil testing before application.";
      }
    }

    if (!mounted) return;
    setState(() {
      if (_messages.isNotEmpty && _messages.last == 'Bot is typing...') {
        _messages.removeLast();
      }
      _messages.add('Bot: $botReply');
    });
  }

  bool _isFarmingQuestion(String lowerMsg) {
    const keywords = [
      'crop',
      'crops',
      'farm',
      'farming',
      'agri',
      'agriculture',
      'seed',
      'soil',
      'irrigation',
      'water',
      'fertilizer',
      'npk',
      'manure',
      'compost',
      'pest',
      'insect',
      'fungus',
      'fungal',
      'disease',
      'blight',
      'rust',
      'mildew',
      'leaf',
      'stem',
      'root',
      'yield',
      'harvest',
      'market',
      'price',
      'mandi',
      'tomato',
      'onion',
      'potato',
      'rice',
      'wheat',
      'maize',
      'cotton',
      'sugarcane',
    ];
    return keywords.any(lowerMsg.contains);
  }

  void _logout() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const AuthScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    List<Widget> widgetOptions = <Widget>[
      HomeScreen(
        onUpload: _uploadImage,
        onNavigate: _onItemTapped,
        data: _data,
      ),
      HeatmapScreen(data: _data),
      GraphScreen(data: _data),
      ChatScreen(messages: _messages, onSend: _addMessage),
      HistoryScreen(history: _scanHistory),
      const MarketScreen(),
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
          BottomNavigationBarItem(
            icon: Icon(Icons.history),
            label: 'History',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.storefront),
            label: 'Market',
          ),
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

class ScanHistoryItem {
  final String imagePath;
  final String disease;
  final String severity;
  final double confidence;
  final Disease diseaseDetails;
  final String locationLabel;
  final double lat;
  final double lng;
  final DateTime timestamp;

  ScanHistoryItem({
    required this.imagePath,
    required this.disease,
    required this.severity,
    required this.confidence,
    required this.diseaseDetails,
    required this.locationLabel,
    required this.lat,
    required this.lng,
    required this.timestamp,
  });
}

class MarketPricePoint {
  final String marketName;
  final String district;
  final double lat;
  final double lng;
  final Map<String, double> pricesPerKgInr;

  const MarketPricePoint({
    required this.marketName,
    required this.district,
    required this.lat,
    required this.lng,
    required this.pricesPerKgInr,
  });
}

class NearbyMarketQuote {
  final MarketPricePoint market;
  final double distanceKm;
  final double pricePerKg;

  const NearbyMarketQuote({
    required this.market,
    required this.distanceKm,
    required this.pricePerKg,
  });
}

class MarketSpot {
  final String marketName;
  final String district;
  final double lat;
  final double lng;

  const MarketSpot({
    required this.marketName,
    required this.district,
    required this.lat,
    required this.lng,
  });
}

const List<MarketSpot> kMarketSpots = [
  MarketSpot(
    marketName: 'Vashi APMC',
    district: 'Navi Mumbai',
    lat: 19.0760,
    lng: 72.9986,
  ),
  MarketSpot(
    marketName: 'Lasalgaon APMC',
    district: 'Nashik',
    lat: 20.1426,
    lng: 74.2395,
  ),
  MarketSpot(
    marketName: 'Pune Gultekdi Market',
    district: 'Pune',
    lat: 18.5018,
    lng: 73.8777,
  ),
  MarketSpot(
    marketName: 'Belgaum APMC',
    district: 'Belagavi',
    lat: 15.8497,
    lng: 74.4977,
  ),
  MarketSpot(
    marketName: 'Hubballi APMC',
    district: 'Dharwad',
    lat: 15.3647,
    lng: 75.1239,
  ),
  MarketSpot(
    marketName: 'Mapusa Market Yard',
    district: 'North Goa',
    lat: 15.5914,
    lng: 73.8089,
  ),
  MarketSpot(
    marketName: 'Margao Municipal Market',
    district: 'South Goa',
    lat: 15.2832,
    lng: 73.9862,
  ),
];

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
    int diseaseCount = data
        .where(
          (d) =>
              d.disease.toLowerCase() != 'healthy' &&
              d.disease.toLowerCase() != 'none',
        )
        .length;
    int healthyCount = totalCrops - diseaseCount;
    return ValueListenableBuilder<String>(
      valueListenable: languageNotifier,
      builder: (_, String currentLang, __) {
        String _t(String key) {
          if (currentLang == 'English') return key;
          Map<String, Map<String, String>> translations = {
            'Marathi': {
              'Good Morning, Farmer!': 'शुभ सकाळ, शेतकरी!',
              'Your crops are healthy today': 'आज तुमची पिके निरोगी आहेत',
              'Quick Stats': 'द्रुत आकडेवारी',
              'Total Crops': 'एकूण पिके',
              'Diseases': 'रोग',
              'Healthy': 'निरोगी',
              'Upload Crop Photo': 'पिकाचा फोटो अपलोड करा',
              'Scan your crops for disease detection': 'रोग शोधण्यासाठी तुमचे पीक स्कॅन करा',
              'Choose Image': 'प्रतिमा निवडा',
              'Features': 'वैशिष्ट्ये',
              'Disease Heatmap': 'रोग हिटमॅप',
              'View diseases in your region': 'तुमच्या प्रदेशातील रोग पहा',
              'Analytics': 'विश्लेषण',
              'Check historical crop data': 'ऐतिहासिक पीक डेटा तपासा',
              'AI Chatbot': 'एआय चॅटबॉट',
              'Ask farming questions': 'शेतीबद्दल प्रश्न विचारा',
              'Daily Tip': 'दैनिक टीप',
              'Water your crops early in the morning to reduce disease risk and maximize water absorption.': 'रोगाचा धोका कमी करण्यासाठी आणि पाणी शोषण वाढवण्यासाठी तुमच्या पिकांना सकाळी लवकर पाणी द्या.',
            },
            'Hindi': {
              'Good Morning, Farmer!': 'सुप्रभात, किसान!',
              'Your crops are healthy today': 'आज आपकी फसलें स्वस्थ हैं',
              'Quick Stats': 'त्वरित आँकड़े',
              'Total Crops': 'कुल फसलें',
              'Diseases': 'रोग',
              'Healthy': 'स्वस्थ',
              'Upload Crop Photo': 'फसल की फोटो अपलोड करें',
              'Scan your crops for disease detection': 'रोग का पता लगाने के लिए अपनी फसल स्कैन करें',
              'Choose Image': 'छवि चुनें',
              'Features': 'विशेषताएं',
              'Disease Heatmap': 'रोग हीटमैप',
              'View diseases in your region': 'अपने क्षेत्र में रोग देखें',
              'Analytics': 'विश्लेषण',
              'Check historical crop data': 'ऐतिहासिक फसल डेटा जांचें',
              'AI Chatbot': 'एआई चैटबॉट',
              'Ask farming questions': 'खेती से जुड़े सवाल पूछें',
              'Daily Tip': 'दैनिक सुझाव',
              'Water your crops early in the morning to reduce disease risk and maximize water absorption.': 'बीमारी के जोखिम को कम करने और पानी के अवशोषण को अधिकतम करने के लिए अपनी फसलों को सुबह जल्दी पानी दें।',
            },
            'Konkani': {
              'Good Morning, Farmer!': 'देव बरी सकाळ, शेतकार!',
              'Your crops are healthy today': 'आयज तुमचीं पिकां बरीं आसात',
              'Quick Stats': 'वेगीं आकडेमोड',
              'Total Crops': 'एकूण पिकां',
              'Diseases': 'रोग',
              'Healthy': 'निरोगी',
              'Upload Crop Photo': 'पिकाचो फोटो घालचो',
              'Scan your crops for disease detection': 'रोग सोदपा खातीर तुमचीं पिकां स्कॅन करात',
              'Choose Image': 'चित्र वेंचून काडात',
              'Features': 'खाशेलपणां',
              'Disease Heatmap': 'रोग हिटमॅप',
              'View diseases in your region': 'तुमच्या वाठारांतले रोग पळयात',
              'Analytics': 'विश्लेषण',
              'Check historical crop data': 'फाटलो पीक डेटा तपासात',
              'AI Chatbot': 'एआय चॅटबॉट',
              'Ask farming questions': 'शेतीविशीं प्रस्न विचारात',
              'Daily Tip': 'दिसपटी टीप',
              'Water your crops early in the morning to reduce disease risk and maximize water absorption.': 'रोगाचो धोको उणो करपाक आनी उदक ओडून घेवप वाडोवपाक फुडें सकाळीं पिकांक उदक दितात.',
            }
          };
          return translations[currentLang]?[key] ?? key;
        }

        return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ==========================================
            // NEW FEATURE: APP PREFERENCES (THEME & LANGUAGE)
            // This interactive card provides Light/Dark mode toggling
            // and Multi-Language selection without changing the core contents
            // ==========================================
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              margin: const EdgeInsets.only(bottom: 20),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16.0,
                  vertical: 8.0,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Language Dropdown selector added here for multi-language support
                    ValueListenableBuilder<String>(
                      valueListenable: languageNotifier,
                      builder: (_, String currentLang, __) {
                        return DropdownButton<String>(
                          value: currentLang,
                          icon: const Padding(
                            padding: EdgeInsets.only(left: 8.0),
                            child: Icon(Icons.language, color: Colors.green),
                          ),
                          elevation: 16,
                          underline: Container(height: 2, color: Colors.green),
                          onChanged: (String? newValue) {
                            if (newValue != null) {
                              languageNotifier.value =
                                  newValue; // Update language state
                            }
                          },
                          // English, Marathi, Hindi, Konkani
                          items:
                              <String>[
                                'English',
                                'Marathi',
                                'Hindi',
                                'Konkani',
                              ].map<DropdownMenuItem<String>>((String value) {
                                return DropdownMenuItem<String>(
                                  value: value,
                                  child: Text(
                                    value,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                );
                              }).toList(),
                        );
                      },
                    ),
                    const Spacer(),
                    // Theme Switcher button for toggling between Light and Dark mode globally
                    ValueListenableBuilder<ThemeMode>(
                      valueListenable: themeNotifier,
                      builder: (_, ThemeMode currentMode, __) {
                        bool isDarkMode = currentMode == ThemeMode.dark;
                        return IconButton(
                          iconSize: 28,
                          color: isDarkMode ? Colors.amber : Colors.blueGrey,
                          icon: Icon(
                            isDarkMode ? Icons.dark_mode : Icons.light_mode,
                          ),
                          onPressed: () {
                            themeNotifier.value = isDarkMode
                                ? ThemeMode.light
                                : ThemeMode.dark; // Update global theme state
                          },
                          tooltip: 'Toggle Theme',
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
            // ==========================================
            const SizedBox(height: 16),
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
                        Text(
                          _t('Good Morning, Farmer!'),
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _t('Your crops are healthy today'),
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
            Text(
              _t('Quick Stats'),
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _StatCard(
                    icon: Icons.grass,
                    label: _t('Total Crops'),
                    value: totalCrops.toString(),
                    color: Colors.green,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _StatCard(
                    icon: Icons.warning,
                    label: _t('Diseases'),
                    value: diseaseCount.toString(),
                    color: Colors.orange,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _StatCard(
                    icon: Icons.check_circle,
                    label: _t('Healthy'),
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
                  Text(
                    _t('Upload Crop Photo'),
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _t('Scan your crops for disease detection'),
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
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.upload),
                          SizedBox(width: 8),
                          Text(
                            _t('Choose Image'),
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
            Text(
              _t('Features'),
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _FeatureCard(
              icon: Icons.map,
              title: _t('Disease Heatmap'),
              description: _t('View diseases in your region'),
              onTap: () => onNavigate(1),
            ),
            const SizedBox(height: 10),
            _FeatureCard(
              icon: Icons.bar_chart,
              title: _t('Analytics'),
              description: _t('Check historical crop data'),
              onTap: () => onNavigate(2),
            ),
            const SizedBox(height: 10),
            _FeatureCard(
              icon: Icons.chat,
              title: _t('AI Chatbot'),
              description: _t('Ask farming questions'),
              onTap: () => onNavigate(3),
            ),
            const SizedBox(height: 10),
            _FeatureCard(
              icon: Icons.storefront,
              title: _t('Local Market Prices'),
              description: _t('Find nearby selling points and average prices'),
              onTap: () => onNavigate(5),
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
                      Text(
                        _t('Daily Tip'),
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _t('Water your crops early in the morning to reduce disease risk and maximize water absorption.'),
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
      },
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
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: _getSeverityColor().withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: _getSeverityColor()),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.circle,
                              color: _getSeverityColor(),
                              size: 12,
                            ),
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
                  const Text(
                    'AI Confidence',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(10),
                          child: LinearProgressIndicator(
                            value: disease.confidence,
                            backgroundColor: Colors.grey[200],
                            color: disease.confidence > 0.8
                                ? Colors.green
                                : (disease.confidence > 0.5
                                      ? Colors.amber
                                      : Colors.red),
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
                  const Text(
                    'Treatment Plan',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  _TreatmentCard(
                    icon: Icons.medical_services,
                    title: 'Treatment',
                    description: disease.treatment,
                    color: Colors.blue,
                  ),
                  const SizedBox(height: 10),
                  _TreatmentCard(
                    icon: Icons.science,
                    title: 'Chemical Solution',
                    description: disease.chemical,
                    color: Colors.purple,
                  ),
                  const SizedBox(height: 10),
                  _TreatmentCard(
                    icon: Icons.scale,
                    title: 'Dosage',
                    description: disease.dosage,
                    color: Colors.green,
                  ),
                  const SizedBox(height: 10),
                  _TreatmentCard(
                    icon: Icons.schedule,
                    title: 'Application Timing',
                    description: disease.timing,
                    color: Colors.orange,
                  ),
                  const SizedBox(height: 24),

                  // Why this diagnosis?
                  if (disease.symptoms.isNotEmpty) ...[
                    const Text(
                      'Why this diagnosis?',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: disease.symptoms
                          .map(
                            (symptom) => Chip(
                              label: Text(
                                symptom,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              backgroundColor: Colors.red[50],
                              side: BorderSide(color: Colors.red[200]!),
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Risk Level
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.orange[50],
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.orange[200]!),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.warning_amber_rounded,
                          color: Colors.orange,
                          size: 28,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: RichText(
                            text: TextSpan(
                              style: DefaultTextStyle.of(context).style.copyWith(
                                fontSize: 16,
                              ),
                              children: [
                                const TextSpan(
                                  text: 'Spread Risk: ',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black87,
                                  ),
                                ),
                                TextSpan(
                                  text: disease.spreadRisk,
                                  style: const TextStyle(
                                    color: Colors.orange,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Next Steps
                  if (disease.nextSteps.isNotEmpty) ...[
                    const Text(
                      'Next Steps',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
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
                        children: disease.nextSteps
                            .map(
                              (step) => Padding(
                                padding: const EdgeInsets.only(bottom: 8.0),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Icon(
                                      Icons.check_circle,
                                      color: Colors.green,
                                      size: 20,
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        step,
                                        style: const TextStyle(fontSize: 14),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            )
                            .toList(),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Prevention Tips
                  const Text(
                    'Prevention',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
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
                        Expanded(
                          child: Text(
                            disease.prevention,
                            style: const TextStyle(fontSize: 14),
                          ),
                        ),
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
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                ChatScreen(messages: [], onSend: onChat),
                          ),
                        );
                      },
                      icon: const Icon(Icons.chat),
                      label: const Text(
                        'Ask AI Chatbot',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
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
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(Icons.arrow_back, color: Colors.green[600]),
                      label: Text(
                        'Go Back',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.green[600],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Disclaimer
                  const Center(
                    child: Text(
                      'AI-based prediction. Verify with local expert.',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey,
                        fontStyle: FontStyle.italic,
                      ),
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
  final Set<Circle> _circles = {};
  bool _locationPermissionGranted = false;
  LatLng? _currentPosition;
  bool _mapReady = false;

  @override
  void initState() {
    super.initState();
    _initMarkers();
    _determinePosition();
  }

  void _initMarkers() {
    for (var d in widget.data) {
      final id = '${d.lat}-${d.lng}';
      _markers.add(
        Marker(
          markerId: MarkerId(id),
          position: LatLng(d.lat, d.lng),
          infoWindow: InfoWindow(title: d.disease, snippet: d.taluka),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed),
        ),
      );
      _circles.add(
        Circle(
          circleId: CircleId('glow-$id'),
          center: LatLng(d.lat, d.lng),
          radius: 170,
          fillColor: Colors.redAccent.withOpacity(0.18),
          strokeColor: Colors.transparent,
          strokeWidth: 0,
        ),
      );
      _circles.add(
        Circle(
          circleId: CircleId('core-$id'),
          center: LatLng(d.lat, d.lng),
          radius: 75,
          fillColor: Colors.red.withOpacity(0.30),
          strokeColor: Colors.redAccent.withOpacity(0.85),
          strokeWidth: 2,
        ),
      );
    }

    for (final market in kMarketSpots) {
      final marketId = 'market-${market.marketName}';
      _markers.add(
        Marker(
          markerId: MarkerId(marketId),
          position: LatLng(market.lat, market.lng),
          infoWindow: InfoWindow(
            title: '${market.marketName} (Selling Market)',
            snippet: market.district,
          ),
          icon: BitmapDescriptor.defaultMarkerWithHue(
            BitmapDescriptor.hueAzure,
          ),
        ),
      );
      _circles.add(
        Circle(
          circleId: CircleId('market-glow-$marketId'),
          center: LatLng(market.lat, market.lng),
          radius: 230,
          fillColor: Colors.greenAccent.withOpacity(0.14),
          strokeColor: Colors.green.withOpacity(0.45),
          strokeWidth: 1,
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
        _currentPosition = LatLng(position.latitude, position.longitude);
      });
      if (_mapReady) {
        mapController.animateCamera(
          CameraUpdate.newCameraPosition(
            CameraPosition(target: _currentPosition!, zoom: 13),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return GoogleMap(
      onMapCreated: (GoogleMapController controller) {
        mapController = controller;
        _mapReady = true;
        if (_currentPosition != null) {
          mapController.animateCamera(
            CameraUpdate.newCameraPosition(
              CameraPosition(target: _currentPosition!, zoom: 13),
            ),
          );
        }
      },
      initialCameraPosition: CameraPosition(
        target: _currentPosition ?? const LatLng(19.0760, 72.8777),
        zoom: _currentPosition != null ? 13 : 10,
      ),
      markers: _markers,
      circles: _circles,
      myLocationEnabled: _locationPermissionGranted,
      myLocationButtonEnabled: _locationPermissionGranted,
    );
  }
}

class HistoryScreen extends StatelessWidget {
  final List<ScanHistoryItem> history;

  const HistoryScreen({super.key, required this.history});

  @override
  Widget build(BuildContext context) {
    if (history.isEmpty) {
      return const Center(
        child: Text(
          'No scan history yet.\nUpload a crop image to create records.',
          textAlign: TextAlign.center,
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: history.length,
      itemBuilder: (context, index) {
        final item = history[index];
        return Card(
          margin: const EdgeInsets.symmetric(vertical: 8),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
            side: BorderSide(color: Colors.redAccent.withOpacity(0.18)),
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(14),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => AnalysisScreen(
                    imagePath: item.imagePath,
                    disease: item.diseaseDetails,
                    onChat: (_) {},
                  ),
                ),
              );
            },
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 14,
                    height: 14,
                    margin: const EdgeInsets.only(top: 6),
                    decoration: BoxDecoration(
                      color: Colors.redAccent,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.redAccent.withOpacity(0.75),
                          blurRadius: 14,
                          spreadRadius: 3,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.file(
                      File(item.imagePath),
                      width: 70,
                      height: 70,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        width: 70,
                        height: 70,
                        color: Colors.grey.shade200,
                        child: const Icon(Icons.broken_image_outlined),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          item.disease,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Severity: ${item.severity}  |  Confidence: ${item.confidence.toStringAsFixed(1)}%',
                          style: TextStyle(color: Colors.grey.shade700),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${item.locationLabel} (${item.lat.toStringAsFixed(4)}, ${item.lng.toStringAsFixed(4)})',
                          style: TextStyle(color: Colors.grey.shade600),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item.timestamp.toLocal().toString(),
                          style: TextStyle(
                            color: Colors.grey.shade500,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class MarketScreen extends StatefulWidget {
  const MarketScreen({super.key});

  @override
  State<MarketScreen> createState() => _MarketScreenState();
}

class _MarketScreenState extends State<MarketScreen> {
  static const List<String> _supportedCrops = [
    'Tomato',
    'Onion',
    'Potato',
    'Rice',
    'Wheat',
    'Maize',
    'Cotton',
    'Sugarcane',
  ];

  static const List<MarketPricePoint> _marketDirectory = [
    MarketPricePoint(
      marketName: 'Vashi APMC',
      district: 'Navi Mumbai',
      lat: 19.0760,
      lng: 72.9986,
      pricesPerKgInr: {
        'Tomato': 22,
        'Onion': 28,
        'Potato': 25,
        'Rice': 44,
        'Wheat': 31,
        'Maize': 24,
      },
    ),
    MarketPricePoint(
      marketName: 'Lasalgaon APMC',
      district: 'Nashik',
      lat: 20.1426,
      lng: 74.2395,
      pricesPerKgInr: {
        'Tomato': 20,
        'Onion': 33,
        'Potato': 23,
        'Maize': 26,
      },
    ),
    MarketPricePoint(
      marketName: 'Pune Gultekdi Market',
      district: 'Pune',
      lat: 18.5018,
      lng: 73.8777,
      pricesPerKgInr: {
        'Tomato': 24,
        'Onion': 30,
        'Potato': 26,
        'Rice': 47,
        'Wheat': 34,
      },
    ),
    MarketPricePoint(
      marketName: 'Belgaum APMC',
      district: 'Belagavi',
      lat: 15.8497,
      lng: 74.4977,
      pricesPerKgInr: {
        'Tomato': 23,
        'Onion': 29,
        'Potato': 24,
        'Sugarcane': 4,
        'Maize': 25,
      },
    ),
    MarketPricePoint(
      marketName: 'Hubballi APMC',
      district: 'Dharwad',
      lat: 15.3647,
      lng: 75.1239,
      pricesPerKgInr: {
        'Tomato': 21,
        'Onion': 27,
        'Rice': 43,
        'Wheat': 32,
        'Cotton': 69,
      },
    ),
    MarketPricePoint(
      marketName: 'Mapusa Market Yard',
      district: 'North Goa',
      lat: 15.5914,
      lng: 73.8089,
      pricesPerKgInr: {
        'Tomato': 26,
        'Onion': 32,
        'Potato': 29,
        'Rice': 49,
      },
    ),
    MarketPricePoint(
      marketName: 'Margao Municipal Market',
      district: 'South Goa',
      lat: 15.2832,
      lng: 73.9862,
      pricesPerKgInr: {
        'Tomato': 25,
        'Onion': 31,
        'Potato': 28,
        'Rice': 48,
      },
    ),
  ];

  String _selectedCrop = _supportedCrops.first;
  bool _loading = true;
  String? _error;
  LatLng? _currentLocation;
  List<NearbyMarketQuote> _quotes = [];
  double? _averagePrice;

  @override
  void initState() {
    super.initState();
    _refreshMarketData();
  }

  Future<void> _refreshMarketData() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw Exception('Location service is disabled.');
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        throw Exception('Location permission was denied.');
      }

      final pos = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      final current = LatLng(pos.latitude, pos.longitude);
      final quotes = _buildQuotesForCrop(_selectedCrop, current);

      setState(() {
        _currentLocation = current;
        _quotes = quotes;
        _averagePrice = quotes.isEmpty
            ? null
            : quotes
                      .map((q) => q.pricePerKg)
                      .reduce((a, b) => a + b) /
                  quotes.length;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  List<NearbyMarketQuote> _buildQuotesForCrop(String crop, LatLng origin) {
    final quotes = <NearbyMarketQuote>[];

    for (final market in _marketDirectory) {
      final price = market.pricesPerKgInr[crop];
      if (price == null) continue;

      final distance = _distanceKm(
        origin.latitude,
        origin.longitude,
        market.lat,
        market.lng,
      );

      quotes.add(
        NearbyMarketQuote(
          market: market,
          distanceKm: distance,
          pricePerKg: price,
        ),
      );
    }

    quotes.sort((a, b) => a.distanceKm.compareTo(b.distanceKm));
    return quotes.take(4).toList();
  }

  double _distanceKm(double lat1, double lon1, double lat2, double lon2) {
    const r = 6371.0;
    final dLat = _toRadians(lat2 - lat1);
    final dLon = _toRadians(lon2 - lon1);
    final a =
        math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(_toRadians(lat1)) *
            math.cos(_toRadians(lat2)) *
            math.sin(dLon / 2) *
            math.sin(dLon / 2);
    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));
    return r * c;
  }

  double _toRadians(double degree) => degree * (math.pi / 180.0);

  @override
  Widget build(BuildContext context) {
    final bestQuote = _quotes.isEmpty
        ? null
        : _quotes.reduce(
            (a, b) => a.pricePerKg >= b.pricePerKg ? a : b,
          );

    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return RefreshIndicator(
      onRefresh: _refreshMarketData,
      child: ListView(
        padding: const EdgeInsets.all(14),
        children: [
          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Local Selling Intelligence',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 10),
                  DropdownButtonFormField<String>(
                    value: _selectedCrop,
                    decoration: const InputDecoration(
                      labelText: 'Select Product/Crop',
                      border: OutlineInputBorder(),
                    ),
                    items: _supportedCrops
                        .map(
                          (crop) => DropdownMenuItem(
                            value: crop,
                            child: Text(crop),
                          ),
                        )
                        .toList(),
                    onChanged: (value) {
                      if (value == null || _currentLocation == null) return;
                      final quotes = _buildQuotesForCrop(value, _currentLocation!);
                      setState(() {
                        _selectedCrop = value;
                        _quotes = quotes;
                        _averagePrice = quotes.isEmpty
                            ? null
                            : quotes
                                      .map((q) => q.pricePerKg)
                                      .reduce((a, b) => a + b) /
                                  quotes.length;
                      });
                    },
                  ),
                  const SizedBox(height: 10),
                  Text(
                    _currentLocation == null
                        ? 'Location unavailable'
                        : 'Your location: ${_currentLocation!.latitude.toStringAsFixed(4)}, ${_currentLocation!.longitude.toStringAsFixed(4)}',
                    style: TextStyle(color: Colors.grey.shade700),
                  ),
                  if (_averagePrice != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      'Avg local selling price for $_selectedCrop: INR ${_averagePrice!.toStringAsFixed(1)} / kg',
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        color: Colors.green,
                      ),
                    ),
                  ],
                  if (bestQuote != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      'Recommended place to sell now: ${bestQuote.market.marketName} (INR ${bestQuote.pricePerKg.toStringAsFixed(1)}/kg)',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ],
                ],
              ),
            ),
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(
                _error!,
                style: const TextStyle(color: Colors.redAccent),
              ),
            ),
          const SizedBox(height: 10),
          ..._quotes.map(
            (quote) => Card(
              child: ListTile(
                leading: const Icon(Icons.storefront, color: Colors.green),
                title: Text(quote.market.marketName),
                subtitle: Text(
                  '${quote.market.district} • ${quote.distanceKm.toStringAsFixed(1)} km away',
                ),
                trailing: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text(
                      'Avg Price',
                      style: TextStyle(fontSize: 11, color: Colors.grey),
                    ),
                    Text(
                      'INR ${quote.pricePerKg.toStringAsFixed(1)}/kg',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.green,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          if (_quotes.isEmpty && _error == null)
            const Padding(
              padding: EdgeInsets.only(top: 18),
              child: Text(
                'No market data found for selected crop near your location.',
                textAlign: TextAlign.center,
              ),
            ),
        ],
      ),
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
  final stt.SpeechToText _speechToText = stt.SpeechToText();
  final FlutterTts _flutterTts = FlutterTts();
  bool _isListening = false;
  bool _voiceOutputEnabled = true;
  String _lastSpokenBotMessage = '';

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _initTts();
  }

  @override
  void didUpdateWidget(covariant ChatScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.messages.isEmpty) return;
    final latest = widget.messages.last;
    if (latest.startsWith('Bot: ') &&
        latest != 'Bot: Bot is typing...' &&
        latest != _lastSpokenBotMessage &&
        _voiceOutputEnabled) {
      _lastSpokenBotMessage = latest;
      final text = latest.replaceFirst('Bot: ', '');
      _speak(text);
    }
  }

  Future<void> _initTts() async {
    await _flutterTts.setLanguage('en-US');
    await _flutterTts.setPitch(1.0);
    await _flutterTts.setSpeechRate(0.45);
  }

  Future<void> _speak(String text) async {
    if (!_voiceOutputEnabled || text.trim().isEmpty) return;
    await _flutterTts.stop();
    await _flutterTts.speak(text);
  }

  Future<void> _toggleListening() async {
    if (_isListening) {
      await _speechToText.stop();
      if (mounted) {
        setState(() {
          _isListening = false;
        });
      }
      return;
    }

    final available = await _speechToText.initialize(
      onStatus: (status) {
        if (status == 'done' && mounted) {
          setState(() {
            _isListening = false;
          });
        }
      },
      onError: (_) {
        if (mounted) {
          setState(() {
            _isListening = false;
          });
        }
      },
    );

    if (!available) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Voice input not available on this device')),
        );
      }
      return;
    }

    setState(() {
      _isListening = true;
    });

    await _speechToText.listen(
      onResult: (result) {
        if (!mounted) return;
        setState(() {
          _controller.text = result.recognizedWords;
          _controller.selection = TextSelection.fromPosition(
            TextPosition(offset: _controller.text.length),
          );
        });
      },
      listenMode: stt.ListenMode.confirmation,
    );
  }

  @override
  void dispose() {
    _speechToText.stop();
    _flutterTts.stop();
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
                    color: _isListening ? Colors.red[500] : Colors.blueGrey[500],
                    borderRadius: BorderRadius.circular(50),
                  ),
                  child: IconButton(
                    icon: Icon(
                      _isListening ? Icons.mic : Icons.mic_none,
                      color: Colors.white,
                    ),
                    onPressed: _toggleListening,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  decoration: BoxDecoration(
                    color: _voiceOutputEnabled ? Colors.deepPurple : Colors.grey,
                    borderRadius: BorderRadius.circular(50),
                  ),
                  child: IconButton(
                    icon: Icon(
                      _voiceOutputEnabled ? Icons.volume_up : Icons.volume_off,
                      color: Colors.white,
                    ),
                    onPressed: () {
                      setState(() {
                        _voiceOutputEnabled = !_voiceOutputEnabled;
                      });
                    },
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
