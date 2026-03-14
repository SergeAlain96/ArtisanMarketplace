import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/auth/session_scope.dart';
import '../../core/widgets/state_views.dart';

class ArtisanDashboardScreen extends StatefulWidget {
  final String apiBaseUrl;

  const ArtisanDashboardScreen({super.key, required this.apiBaseUrl});

  @override
  State<ArtisanDashboardScreen> createState() => _ArtisanDashboardScreenState();
}

class _ArtisanDashboardScreenState extends State<ArtisanDashboardScreen> {
  late final ApiClient _api;
  bool _initialized = false;
  bool _loading = true;
  bool _saving = false;
  String _error = '';
  List<dynamic> _items = [];

  List<String> _parseImageUrls(String rawValue) {
    return rawValue
        .split(RegExp(r'\r?\n|,'))
        .map((item) => item.trim())
        .where((item) => item.isNotEmpty)
        .toList();
  }

  bool _isValidUrl(String value) {
    final uri = Uri.tryParse(value);
    return uri != null && uri.hasScheme && (uri.scheme == 'http' || uri.scheme == 'https') && uri.hasAuthority;
  }

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

  Future<void> _load() async {
    final session = SessionScope.of(context);
    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      final response = await _api.getJson('/products/mine', token: session.token);
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

  Future<void> _openProductDialog({Map<String, dynamic>? product}) async {
    final nameController = TextEditingController(text: (product?['name'] ?? '').toString());
    final descriptionController = TextEditingController(text: (product?['description'] ?? '').toString());
    final priceController = TextEditingController(text: (product?['price'] ?? '').toString());
    final images = ((product?['images'] as List<dynamic>?) ?? <dynamic>[]).map((item) => item.toString()).toList();
    final imageUrlsController = TextEditingController(text: images.join('\n'));
    final formKey = GlobalKey<FormState>();
    final isEdit = product != null;

    await showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(isEdit ? 'Modifier produit' : 'Créer produit'),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Nom'),
                  validator: (value) => (value == null || value.trim().length < 2) ? 'Minimum 2 caractères' : null,
                ),
                const SizedBox(height: 10),
                TextFormField(
                  controller: descriptionController,
                  decoration: const InputDecoration(labelText: 'Description'),
                  minLines: 2,
                  maxLines: 4,
                  validator: (value) => (value == null || value.trim().length < 5) ? 'Minimum 5 caractères' : null,
                ),
                const SizedBox(height: 10),
                TextFormField(
                  controller: priceController,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(labelText: 'Prix'),
                  validator: (value) {
                    final parsed = num.tryParse((value ?? '').trim());
                    if (parsed == null || parsed < 0) return 'Prix invalide';
                    return null;
                  },
                ),
                const SizedBox(height: 10),
                TextFormField(
                  controller: imageUrlsController,
                  decoration: const InputDecoration(
                    labelText: 'URLs images (1 par ligne)',
                    hintText: 'https://.../image-1.jpg',
                  ),
                  minLines: 2,
                  maxLines: 5,
                  validator: (value) {
                    final urls = _parseImageUrls(value ?? '');
                    final invalid = urls.where((url) => !_isValidUrl(url)).toList();
                    if (invalid.isNotEmpty) {
                      return 'Une ou plusieurs URLs image sont invalides';
                    }
                    return null;
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: _saving ? null : () => Navigator.pop(context),
              child: const Text('Annuler'),
            ),
            FilledButton(
              onPressed: _saving
                  ? null
                  : () async {
                      if (!formKey.currentState!.validate()) return;

                      final session = SessionScope.of(this.context);
                      final payload = {
                        'name': nameController.text.trim(),
                        'description': descriptionController.text.trim(),
                        'price': num.parse(priceController.text.trim()),
                        'images': _parseImageUrls(imageUrlsController.text),
                      };

                      setState(() {
                        _saving = true;
                        _error = '';
                      });

                      try {
                        if (isEdit) {
                          await _api.putJson('/products/${product['_id']}', payload, token: session.token);
                        } else {
                          await _api.postJson('/products', payload, token: session.token);
                        }

                        if (!mounted) return;
                        Navigator.pop(context);
                        await _load();
                      } catch (e) {
                        if (mounted) {
                          setState(() {
                            _error = e.toString();
                          });
                        }
                      } finally {
                        if (mounted) {
                          setState(() {
                            _saving = false;
                          });
                        }
                      }
                    },
              child: Text(_saving ? '...' : (isEdit ? 'Mettre à jour' : 'Créer')),
            ),
          ],
        );
      },
    );
  }

  Future<void> _deleteProduct(Map<String, dynamic> product) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Supprimer produit'),
          content: Text('Confirmer la suppression de "${(product['name'] ?? 'Produit').toString()}" ?'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Annuler')),
            FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Supprimer')),
          ],
        );
      },
    );

    if (confirm != true) return;

    final session = SessionScope.of(context);
    setState(() {
      _saving = true;
      _error = '';
    });

    try {
      await _api.deleteJson('/products/${product['_id']}', token: session.token);
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
      appBar: AppBar(
        title: const Text('Dashboard Artisan'),
        actions: [
          IconButton(
            tooltip: 'Profil artisan',
            onPressed: _saving ? null : () => Navigator.pushNamed(context, '/artisan/profile'),
            icon: const Icon(Icons.badge_outlined),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _saving ? null : () => _openProductDialog(),
        icon: const Icon(Icons.add),
        label: const Text('Produit'),
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _loading
          ? const LoadingListView(itemCount: 4)
          : _error.isNotEmpty && _items.isEmpty
            ? ErrorStateView(
              message: _error,
              onRetry: _load,
              title: 'Impossible de charger le dashboard artisan',
              )
            : ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Text('Connecté: ${session.name} (${session.email})'),
                  const SizedBox(height: 8),
                  if (_error.isNotEmpty)
                    Text(_error, style: const TextStyle(color: Colors.red)),
                  if (_error.isEmpty && _items.isEmpty)
                    const EmptyStateView(
                      message: 'Aucun produit trouvé pour cet artisan.',
                      icon: Icons.inventory_2_outlined,
                    ),
                  if (_saving) ...[
                    const SizedBox(height: 8),
                    const LinearProgressIndicator(),
                  ],
                  ..._items.map((item) {
                    final product = item as Map<String, dynamic>;
                    final images = ((product['images'] as List<dynamic>?) ?? <dynamic>[]).map((item) => item.toString()).toList();
                    final imageUrl = images.isNotEmpty ? images.first : '';
                    return Card(
                      child: ListTile(
                        leading: imageUrl.isNotEmpty
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: Image.network(
                                  imageUrl,
                                  width: 52,
                                  height: 52,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const _ProductImageFallback(),
                                ),
                              )
                            : const _ProductImageFallback(),
                        title: Text((product['name'] ?? 'Produit').toString()),
                        subtitle: Text(
                          '${(product['description'] ?? '').toString()}\n${images.length} image(s)',
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                        trailing: Wrap(
                          spacing: 2,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            Text('${(product['price'] ?? 0).toString()} €'),
                            IconButton(
                              tooltip: 'Modifier',
                              onPressed: _saving ? null : () => _openProductDialog(product: product),
                              icon: const Icon(Icons.edit_outlined),
                            ),
                            IconButton(
                              tooltip: 'Supprimer',
                              onPressed: _saving ? null : () => _deleteProduct(product),
                              icon: const Icon(Icons.delete_outline),
                            ),
                          ],
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

class _ProductImageFallback extends StatelessWidget {
  const _ProductImageFallback();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 52,
      height: 52,
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Icon(
        Icons.image_outlined,
        color: Theme.of(context).colorScheme.outline,
      ),
    );
  }
}
