import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import 'dart:io';

void main() {
  runApp(const GemmaChatApp());
}

class GemmaChatApp extends StatelessWidget {
  const GemmaChatApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Gemma Chat',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const ChatScreen(),
    );
  }
}

class Message {
  final String text;
  final bool isUser;
  final File? image;

  Message({required this.text, required this.isUser, this.image});
}

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<Message> _messages = [];
  final SpeechToText _speechToText = SpeechToText();
  final Dio _dio = Dio();
  
  // CHANGE THIS TO YOUR CLOUDFLARE URL ONCE GENERATED
  final String _apiUrl = 'https://pos-recorder-city-origins.trycloudflare.com'; 
  // CHANGE THIS TO YOUR MODEL NAME (e.g., 'gemma', 'llama3', etc.)
  final String _modelName = 'gemma4:latest'; 

  bool _isListening = false;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _initSpeech();
  }

  void _initSpeech() async {
    await _speechToText.initialize();
    if (mounted) setState(() {});
  }

  void _listen() async {
    if (!_isListening) {
      bool available = await _speechToText.initialize();
      if (available) {
        setState(() => _isListening = true);
        _speechToText.listen(onResult: (result) {
          if (result.finalResult) {
            setState(() {
              _messages.add(Message(text: result.recognizedWords, isUser: true));
              _controller.text = result.recognizedWords;
              _isListening = false;
            });
          }
        });
      }
    } else {
      setState(() => _isListening = false);
      _speechToText.stop();
    }
  }

  void _sendMessage() async {
    if (_controller.text.trim().isEmpty) return;
    
    final userText = _controller.text;
    setState(() {
      _messages.add(Message(text: userText, isUser: true));
      _controller.clear();
    });
    
    try {
      final response = await _dio.post(
        '$_apiUrl/api/generate',
        data: {
          'model': _modelName,
          'prompt': userText,
          'stream': false,
        },
      );

      if (response.statusCode == 200) {
        final reply = response.data['response'];
        if (mounted) {
          setState(() {
            _messages.add(Message(text: reply, isUser: false));
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add(Message(text: "Error: $e", isUser: false));
        });
      }
    }
  }

  void _pickImage() async {
    final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() {
        _messages.add(Message(text: "", isUser: true, image: File(image.path)));
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gemma 4 Chat'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(10),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return _buildMessageBubble(msg);
              },
            ),
          ),
          _buildInputArea(),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(Message msg) {
    return Align(
      alignment: msg.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 5),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: msg.isUser ? Colors.blue[100] : Colors.grey[300],
          borderRadius: BorderRadius.circular(15),
        ),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (msg.image != null) Image.file(msg.image!, height: 150),
            if (msg.text.isNotEmpty) Text(msg.text, style: const TextStyle(fontSize: 16)),
          ],
        ),
      ),
    );
  }

  Widget _buildInputArea() {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Row(
        children: [
          IconButton(
            icon: Icon(_isListening ? Icons.mic : Icons.mic_none, color: _isListening ? Colors.red : Colors.blue),
            onPressed: _listen,
          ),
          IconButton(
            icon: const Icon(Icons.image),
            onPressed: _pickImage,
          ),
          Expanded(
            child: TextField(
              controller: _controller,
              decoration: const InputDecoration(
                hintText: 'Type a message...',
                border: OutlineInputBorder(),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.send),
            onPressed: _sendMessage,
          ),
        ],
      ),
    );
  }
}
