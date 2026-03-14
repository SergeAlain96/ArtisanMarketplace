import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/auth/session_scope.dart';
import '../../core/widgets/state_views.dart';

class ArtisanProfileScreen extends StatefulWidget {
  final String apiBaseUrl;

  const ArtisanProfileScreen({super.key, required this.apiBaseUrl});

  @override
  State<ArtisanProfileScreen> createState() => _ArtisanProfileScreenState();
}

class _ArtisanProfileScreenState extends State<ArtisanProfileScreen> {
  late final ApiClient _api;
  final _formKey = GlobalKey<FormState>();
  final _bioController = TextEditingController();
  final _locationController = TextEditingController();
  final _avatarController = TextEditingController();

  bool _loading = true;
  bool _saving = false;
  bool _initialized = false;
  bool _exists = false;
  String _error = '';
  String _message = '';

  @override
  void initState() {
    super.initState();
    _api = ApiClient(baseUrl: widget.apiBaseUrl);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_initialized) return;
    _initialized = true;
    _load();
  }

  @override
  void dispose() {
    _bioController.dispose();
    _locationController.dispose();
    _avatarController.dispose();
    super.dispose();
  }

  bool _isValidUrl(String value) {
    if (value.trim().isEmpty) return true;
    final uri = Uri.tryParse(value.trim());
    return uri != null && uri.hasScheme && (uri.scheme == 'http' || uri.scheme == 'https') && uri.hasAuthority;
  }

  Future<void> _load() async {
    final session = SessionScope.of(context);
    setState(() {
      _loading = true;
      _error = '';
      _message = '';
    });

    try {
      final response = await _api.getJson('/artisan/profile', token: session.token);
      final data = (response['data'] as Map<String, dynamic>?) ?? <String, dynamic>{};
      final profile = (data['profile'] as Map<String, dynamic>?) ?? <String, dynamic>{};

      setState(() {
        _exists = (data['exists'] ?? false) == true;
        _bioController.text = (profile['bio'] ?? '').toString();
        _locationController.text = (profile['location'] ?? '').toString();
        _avatarController.text = (profile['avatarUrl'] ?? '').toString();
      });
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

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;

    final session = SessionScope.of(context);
    final payload = {
      'bio': _bioController.text.trim(),
      'location': _locationController.text.trim(),
      'avatarUrl': _avatarController.text.trim(),
    };

    setState(() {
      _saving = true;
      _error = '';
      _message = '';
    });

    try {
      if (_exists) {
        await _api.putJson('/artisan/profile', payload, token: session.token);
      } else {
        await _api.postJson('/artisan/profile', payload, token: session.token);
      }

      setState(() {
        _message = _exists ? 'Profil mis à jour.' : 'Profil créé.';
        _exists = true;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _saving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profil artisan')),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _loading
            ? const LoadingListView(itemCount: 3)
            : _error.isNotEmpty && !_exists && _bioController.text.isEmpty && _locationController.text.isEmpty
                ? ErrorStateView(
                    message: _error,
                    onRetry: _load,
                    title: 'Impossible de charger le profil artisan',
                  )
                : ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      Text(
                        _exists ? 'Gérer le profil public artisan' : 'Créer le profil public artisan',
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                      const SizedBox(height: 12),
                      Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            TextFormField(
                              controller: _locationController,
                              decoration: const InputDecoration(labelText: 'Localisation'),
                              validator: (value) {
                                if ((value ?? '').trim().length > 120) return 'Maximum 120 caractères';
                                return null;
                              },
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _avatarController,
                              decoration: const InputDecoration(labelText: 'Avatar URL'),
                              validator: (value) {
                                if (!_isValidUrl(value ?? '')) return 'URL avatar invalide';
                                return null;
                              },
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: _bioController,
                              decoration: const InputDecoration(labelText: 'Bio'),
                              minLines: 3,
                              maxLines: 5,
                              validator: (value) {
                                if ((value ?? '').trim().length > 500) return 'Maximum 500 caractères';
                                return null;
                              },
                            ),
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: FilledButton(
                                onPressed: _saving ? null : _save,
                                child: Text(_saving ? 'Enregistrement...' : (_exists ? 'Mettre à jour' : 'Créer le profil')),
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
      ),
    );
  }
}
