import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/auth/session_scope.dart';

class LoginScreen extends StatefulWidget {
  final String apiBaseUrl;

  const LoginScreen({super.key, required this.apiBaseUrl});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late final ApiClient _api;
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _loading = false;
  String _message = '';
  String _error = '';

  @override
  void initState() {
    super.initState();
    _api = ApiClient(baseUrl: widget.apiBaseUrl);
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _loading = true;
      _error = '';
      _message = '';
    });

    try {
      final response = await _api.postJson('/auth/login', {
        'email': _emailController.text.trim(),
        'password': _passwordController.text,
      });
      final data = response['data'] as Map<String, dynamic>?;
      final token = (data?['token'] ?? '').toString();
      final user = (data?['user'] as Map<String, dynamic>?) ?? <String, dynamic>{};
      final role = (user['role'] ?? '').toString();
      final name = (user['name'] ?? '').toString();
      final email = (user['email'] ?? '').toString();
      final userId = (user['id'] ?? '').toString();

      if (token.isNotEmpty) {
        await SessionScope.of(context).setSession(
          token: token,
          role: role,
          name: name,
          email: email,
          userId: userId,
        );
      }

      setState(() {
        _message = 'Connexion réussie ($role).';
      });

      if (!mounted) return;
      if (role == 'admin') {
        Navigator.pushReplacementNamed(context, '/dashboard/admin');
      } else if (role == 'artisan') {
        Navigator.pushReplacementNamed(context, '/dashboard/artisan');
      } else {
        Navigator.pushReplacementNamed(context, '/');
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Connexion')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Form(
            key: _formKey,
            child: Column(
              children: [
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: 'Email'),
                  validator: (value) => (value == null || value.isEmpty) ? 'Email requis' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _passwordController,
                  decoration: const InputDecoration(labelText: 'Mot de passe'),
                  obscureText: true,
                  validator: (value) => (value == null || value.length < 8) ? 'Minimum 8 caractères' : null,
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: _loading ? null : _submit,
                    child: Text(_loading ? 'Connexion...' : 'Se connecter'),
                  ),
                ),
              ],
            ),
          ),
          if (_message.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(_message, style: const TextStyle(color: Colors.green)),
          ],
          if (_error.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(_error, style: const TextStyle(color: Colors.red)),
          ],
        ],
      ),
    );
  }
}
