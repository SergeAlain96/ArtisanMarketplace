import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/favorites/favorites_scope.dart';
import '../../core/widgets/main_navigation_bar.dart';
import '../../core/widgets/state_views.dart';

class ProductScreen extends StatefulWidget {
  final String apiBaseUrl;

  const ProductScreen({super.key, required this.apiBaseUrl});

  @override
  State<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends State<ProductScreen> {
  late final ApiClient _api;
  bool _loading = true;
  bool _loadingMore = false;
  String _error = '';
  List<dynamic> _items = [];
  String _search = '';
  String _sort = 'newest';
  int _page = 1;
  int _limit = 20;
  int _totalPages = 1;

  @override
  void initState() {
    super.initState();
    _api = ApiClient(baseUrl: widget.apiBaseUrl);
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = '';
      _page = 1;
      _totalPages = 1;
      _items = [];
    });

    try {
      final response = await _api.getJson('/products?page=$_page&limit=$_limit');
      final data = response['data'] as Map<String, dynamic>?;
      setState(() {
        _items = (data?['items'] as List<dynamic>?) ?? [];
        _totalPages = (data?['totalPages'] as num?)?.toInt() ?? 1;
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

  Future<void> _loadMore() async {
    if (_loadingMore) return;
    if (_page >= _totalPages) return;

    setState(() {
      _loadingMore = true;
      _error = '';
    });

    try {
      final nextPage = _page + 1;
      final response = await _api.getJson('/products?page=$nextPage&limit=$_limit');
      final data = response['data'] as Map<String, dynamic>?;
      final moreItems = (data?['items'] as List<dynamic>?) ?? [];

      setState(() {
        _page = nextPage;
        _totalPages = (data?['totalPages'] as num?)?.toInt() ?? _totalPages;
        _items = [..._items, ...moreItems];
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _loadingMore = false;
        });
      }
    }
  }

  List<dynamic> _computedItems() {
    final query = _search.trim().toLowerCase();
    final filtered = query.isEmpty
        ? _items
        : _items.where((raw) {
            final item = raw as Map<String, dynamic>;
            final name = (item['name'] ?? '').toString().toLowerCase();
            final description = (item['description'] ?? '').toString().toLowerCase();
            final artisanName = (item['artisanId']?['name'] ?? '').toString().toLowerCase();
            return name.contains(query) || description.contains(query) || artisanName.contains(query);
          }).toList();

    final sorted = [...filtered];
    if (_sort == 'price_asc') {
      sorted.sort((a, b) => ((a as Map<String, dynamic>)['price'] as num? ?? 0)
          .compareTo(((b as Map<String, dynamic>)['price'] as num? ?? 0)));
    } else if (_sort == 'price_desc') {
      sorted.sort((a, b) => ((b as Map<String, dynamic>)['price'] as num? ?? 0)
          .compareTo(((a as Map<String, dynamic>)['price'] as num? ?? 0)));
    }

    return sorted;
  }

  @override
  Widget build(BuildContext context) {
    final favorites = FavoritesScope.of(context);
    final displayed = _computedItems();
    final canLoadMore = _page < _totalPages;

    return Scaffold(
      appBar: AppBar(title: const Text('Produits')),
      bottomNavigationBar: const MainNavigationBar(currentIndex: 2),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _loading
            ? const LoadingListView(showToolbarStub: true)
            : _error.isNotEmpty
                ? ErrorStateView(
                    message: _error,
                    onRetry: _load,
                    title: 'Impossible de charger les produits',
                  )
                : ListView(
                    padding: const EdgeInsets.all(12),
                    children: [
                      TextField(
                        decoration: const InputDecoration(
                          labelText: 'Rechercher produit / artisan',
                          prefixIcon: Icon(Icons.search),
                        ),
                        onChanged: (value) {
                          setState(() {
                            _search = value;
                          });
                        },
                      ),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        value: _sort,
                        decoration: const InputDecoration(labelText: 'Tri'),
                        items: const [
                          DropdownMenuItem(value: 'newest', child: Text('Plus récents')),
                          DropdownMenuItem(value: 'price_asc', child: Text('Prix croissant')),
                          DropdownMenuItem(value: 'price_desc', child: Text('Prix décroissant')),
                        ],
                        onChanged: (value) {
                          if (value == null) return;
                          setState(() {
                            _sort = value;
                          });
                        },
                      ),
                      const SizedBox(height: 8),
                      Text('${displayed.length} produit(s) affiché(s)'),
                      const SizedBox(height: 6),
                      if (displayed.isEmpty)
                        const EmptyStateView(
                          message: 'Aucun produit trouvé pour ce filtre.',
                          icon: Icons.inventory_2_outlined,
                        ),
                      ...displayed.map((raw) {
                        final item = raw as Map<String, dynamic>;
                        final name = (item['name'] ?? 'Produit').toString();
                        final description = (item['description'] ?? '').toString();
                        final price = (item['price'] ?? 0).toString();
                        final artisanName = (item['artisanId']?['name'] ?? 'N/A').toString();
                        final images = ((item['images'] as List<dynamic>?) ?? <dynamic>[]).map((image) => image.toString()).toList();
                        final imageUrl = images.isNotEmpty ? images.first : '';
                        final productId = (item['_id'] ?? '').toString();
                        final isFavorite = favorites.isProductFavorite(productId);

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
                            title: Text(name),
                            subtitle: Text('$description\nArtisan: $artisanName\n${images.length} image(s)'),
                            trailing: Wrap(
                              spacing: 2,
                              crossAxisAlignment: WrapCrossAlignment.center,
                              children: [
                                Text('$price €'),
                                IconButton(
                                  tooltip: isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris',
                                  onPressed: productId.isEmpty
                                      ? null
                                      : () => favorites.toggleProduct({
                                            'id': productId,
                                            'name': name,
                                            'subtitle': 'Artisan: $artisanName',
                                            'price': '$price €',
                                          }),
                                  icon: Icon(isFavorite ? Icons.bookmark : Icons.bookmark_border, color: Colors.amber.shade700),
                                ),
                              ],
                            ),
                            isThreeLine: true,
                          ),
                        );
                      }),
                      if (canLoadMore)
                        Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Center(
                            child: OutlinedButton(
                              onPressed: _loadingMore ? null : _loadMore,
                              child: Text(_loadingMore ? 'Chargement...' : 'Charger plus'),
                            ),
                          ),
                        ),
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
