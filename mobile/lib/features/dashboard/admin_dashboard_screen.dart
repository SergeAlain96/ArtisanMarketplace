import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/auth/session_scope.dart';
import '../../core/widgets/state_views.dart';

class AdminDashboardScreen extends StatefulWidget {
  final String apiBaseUrl;

  const AdminDashboardScreen({super.key, required this.apiBaseUrl});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  late final ApiClient _api;
  final TextEditingController _searchController = TextEditingController();
  final TextEditingController _productIdController = TextEditingController();
  bool _initialized = false;
  bool _loading = true;
  bool _saving = false;
  String _error = '';
  String _message = '';
  List<dynamic> _items = [];

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
    _searchController.dispose();
    _productIdController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final session = SessionScope.of(context);
    final search = _searchController.text.trim();
    final query = search.isEmpty ? '' : '&search=${Uri.encodeQueryComponent(search)}';
    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      final response = await _api.getJson('/admin/artisans?page=1&limit=10$query', token: session.token);
      final data = response['data'] as Map<String, dynamic>?;
      setState(() {
        _items = (data?['items'] as List<dynamic>?) ?? [];
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

  Future<void> _deleteArtisan(Map<String, dynamic> artisan) async {
    final artisanId = (artisan['_id'] ?? '').toString();
    if (artisanId.isEmpty) return;

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Supprimer artisan'),
        content: Text('Confirmer la suppression de ${(artisan['name'] ?? 'cet artisan').toString()} ?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Supprimer')),
        ],
      ),
    );

    if (confirmed != true) return;

    final session = SessionScope.of(context);
    setState(() {
      _saving = true;
      _error = '';
      _message = '';
    });

    try {
      final response = await _api.deleteJson('/admin/artisan/$artisanId', token: session.token);
      final data = (response['data'] as Map<String, dynamic>?) ?? <String, dynamic>{};
      final summary = (data['moderationSummary'] as Map<String, dynamic>?) ?? <String, dynamic>{};
      setState(() {
        _message = 'Artisan supprimé. Produits: ${(summary['productsDeleted'] ?? 0)}, avis reçus: ${(summary['ratingsReceivedDeleted'] ?? 0)}.';
      });
      await _load();
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

  Future<void> _deleteProductById() async {
    final productId = _productIdController.text.trim();
    if (productId.isEmpty) return;

    final session = SessionScope.of(context);
    setState(() {
      _saving = true;
      _error = '';
      _message = '';
    });

    try {
      final response = await _api.deleteJson('/admin/product/$productId', token: session.token);
      final data = (response['data'] as Map<String, dynamic>?) ?? <String, dynamic>{};
      final summary = (data['moderationSummary'] as Map<String, dynamic>?) ?? <String, dynamic>{};
      setState(() {
        _message = 'Produit supprimé: ${(summary['productName'] ?? productId).toString()}';
        _productIdController.clear();
      });
      await _load();
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
    final session = SessionScope.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard Admin')),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _loading
          ? const LoadingListView(itemCount: 4)
          : _error.isNotEmpty && _items.isEmpty
            ? ErrorStateView(
              message: _error,
              onRetry: _load,
              title: 'Impossible de charger le dashboard admin',
              )
            : ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Text('Connecté: ${session.name} (${session.email})'),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      labelText: 'Recherche artisan (nom/email)',
                      prefixIcon: const Icon(Icons.search),
                      suffixIcon: IconButton(
                        onPressed: _saving ? null : _load,
                        icon: const Icon(Icons.refresh),
                      ),
                    ),
                    onSubmitted: (_) => _load(),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _productIdController,
                          decoration: const InputDecoration(labelText: 'Supprimer produit par ID'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      FilledButton(
                        onPressed: _saving ? null : _deleteProductById,
                        child: const Text('Supprimer'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (_error.isNotEmpty)
                    Text(_error, style: const TextStyle(color: Colors.red)),
                  if (_message.isNotEmpty)
                    Text(_message, style: const TextStyle(color: Colors.green)),
                  if (_error.isEmpty && _items.isEmpty)
                    const EmptyStateView(
                      message: 'Aucun artisan à modérer pour le moment.',
                      icon: Icons.admin_panel_settings_outlined,
                    ),
                  if (_saving) ...[
                    const SizedBox(height: 8),
                    const LinearProgressIndicator(),
                  ],
                  ..._items.map((item) {
                    final artisan = item as Map<String, dynamic>;
                    final moderation = (artisan['moderation'] as Map<String, dynamic>?) ?? <String, dynamic>{};
                    return Card(
                      child: ListTile(
                        title: Text((artisan['name'] ?? 'Artisan').toString()),
                        subtitle: Text(
                          '${(artisan['email'] ?? '').toString()}\nProduits: ${(moderation['productsCount'] ?? 0)} · Avis: ${(moderation['ratingsCount'] ?? 0)}',
                        ),
                        isThreeLine: true,
                        trailing: IconButton(
                          tooltip: 'Supprimer artisan',
                          onPressed: _saving ? null : () => _deleteArtisan(artisan),
                          icon: const Icon(Icons.delete_outline),
                        ),
                      ),
                    );
                  }),
                ],
              ),
      ),
    );
  }
}
