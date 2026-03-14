import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/favorites/favorites_scope.dart';
import '../../core/auth/session_scope.dart';
import '../../core/widgets/state_views.dart';

class ArtisanDetailScreen extends StatefulWidget {
  final String apiBaseUrl;
  final String artisanId;
  final String artisanName;

  const ArtisanDetailScreen({
    super.key,
    required this.apiBaseUrl,
    required this.artisanId,
    required this.artisanName,
  });

  @override
  State<ArtisanDetailScreen> createState() => _ArtisanDetailScreenState();
}

class _ArtisanDetailScreenState extends State<ArtisanDetailScreen> {
  late final ApiClient _api;
  bool _loading = true;
  bool _savingRating = false;
  String _error = '';
  Map<String, dynamic> _details = <String, dynamic>{};
  Map<String, dynamic> _ratings = <String, dynamic>{
    'items': <dynamic>[],
    'average': 0,
    'count': 0,
  };

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
    });

    try {
      final results = await Future.wait([
        _api.getJson('/artisan/${widget.artisanId}'),
        _api.getJson('/artisan/${widget.artisanId}/ratings'),
      ]);

      final detailData = (results[0]['data'] as Map<String, dynamic>?) ?? <String, dynamic>{};
      final ratingData = (results[1]['data'] as Map<String, dynamic>?) ?? <String, dynamic>{};

      setState(() {
        _details = detailData;
        _ratings = ratingData;
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

  Future<void> _openRatingDialog() async {
    final session = SessionScope.of(context);
    if (!session.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Connecte-toi pour laisser un avis.')),
      );
      return;
    }

    final int currentUserId = int.tryParse(session.userId) ?? 0;
    final int artisanId = int.tryParse(widget.artisanId) ?? 0;
    if (currentUserId > 0 && artisanId > 0 && currentUserId == artisanId) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tu ne peux pas te noter toi-même.')),
      );
      return;
    }

    final formKey = GlobalKey<FormState>();
    final commentController = TextEditingController();
    double ratingValue = 5;

    await showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('Laisser un avis'),
              content: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Note: ${ratingValue.toStringAsFixed(0)} / 5'),
                    Slider(
                      value: ratingValue,
                      min: 1,
                      max: 5,
                      divisions: 4,
                      label: ratingValue.toStringAsFixed(0),
                      onChanged: (value) {
                        setDialogState(() {
                          ratingValue = value;
                        });
                      },
                    ),
                    TextFormField(
                      controller: commentController,
                      minLines: 2,
                      maxLines: 4,
                      decoration: const InputDecoration(labelText: 'Commentaire'),
                      validator: (value) {
                        if ((value ?? '').length > 500) {
                          return 'Maximum 500 caractères';
                        }
                        return null;
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: _savingRating ? null : () => Navigator.pop(dialogContext),
                  child: const Text('Annuler'),
                ),
                FilledButton(
                  onPressed: _savingRating
                      ? null
                      : () async {
                          if (!formKey.currentState!.validate()) return;

                          setState(() {
                            _savingRating = true;
                            _error = '';
                          });

                          try {
                            await _api.postJson(
                              '/ratings',
                              {
                                'artisanId': widget.artisanId,
                                'rating': ratingValue.toInt(),
                                'comment': commentController.text.trim(),
                              },
                              token: session.token,
                            );

                            if (!mounted) return;
                            Navigator.pop(dialogContext);
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
                                _savingRating = false;
                              });
                            }
                          }
                        },
                  child: Text(_savingRating ? '...' : 'Envoyer'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _openEditRatingDialog(Map<String, dynamic> rating) async {
    final session = SessionScope.of(context);
    final ratingId = (rating['_id'] ?? '').toString();
    if (ratingId.isEmpty) return;

    final formKey = GlobalKey<FormState>();
    final commentController = TextEditingController(text: (rating['comment'] ?? '').toString());
    double ratingValue = ((rating['rating'] ?? 5) as num).toDouble();

    await showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('Modifier ton avis'),
              content: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Note: ${ratingValue.toStringAsFixed(0)} / 5'),
                    Slider(
                      value: ratingValue,
                      min: 1,
                      max: 5,
                      divisions: 4,
                      label: ratingValue.toStringAsFixed(0),
                      onChanged: (value) {
                        setDialogState(() {
                          ratingValue = value;
                        });
                      },
                    ),
                    TextFormField(
                      controller: commentController,
                      minLines: 2,
                      maxLines: 4,
                      decoration: const InputDecoration(labelText: 'Commentaire'),
                      validator: (value) {
                        if ((value ?? '').length > 500) {
                          return 'Maximum 500 caractères';
                        }
                        return null;
                      },
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: _savingRating ? null : () => Navigator.pop(dialogContext),
                  child: const Text('Annuler'),
                ),
                FilledButton(
                  onPressed: _savingRating
                      ? null
                      : () async {
                          if (!formKey.currentState!.validate()) return;

                          setState(() {
                            _savingRating = true;
                            _error = '';
                          });

                          try {
                            await _api.putJson(
                              '/ratings/$ratingId',
                              {
                                'rating': ratingValue.toInt(),
                                'comment': commentController.text.trim(),
                              },
                              token: session.token,
                            );

                            if (!mounted) return;
                            Navigator.pop(dialogContext);
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
                                _savingRating = false;
                              });
                            }
                          }
                        },
                  child: Text(_savingRating ? '...' : 'Enregistrer'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _deleteRating(Map<String, dynamic> rating) async {
    final session = SessionScope.of(context);
    final ratingId = (rating['_id'] ?? '').toString();
    if (ratingId.isEmpty) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Supprimer avis'),
          content: const Text('Confirmer la suppression de ton avis ?'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Annuler')),
            FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Supprimer')),
          ],
        );
      },
    );

    if (confirm != true) return;

    setState(() {
      _savingRating = true;
      _error = '';
    });

    try {
      await _api.deleteJson('/ratings/$ratingId', token: session.token);
      await _load();
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _savingRating = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = SessionScope.of(context);
    final favorites = FavoritesScope.of(context);
    final products = (_details['products'] as List<dynamic>?) ?? <dynamic>[];
    final ratingItems = (_ratings['items'] as List<dynamic>?) ?? <dynamic>[];
    final average = (_ratings['average'] ?? 0).toString();
    final count = (_ratings['count'] ?? 0).toString();
    final artisanName = (_details['artisan']?['name'] ?? widget.artisanName).toString();
    final artisanLocation = (_details['profile']?['location'] ?? 'Localisation non définie').toString();
    final isFavorite = favorites.isArtisanFavorite(widget.artisanId);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.artisanName),
        actions: [
          IconButton(
            tooltip: isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris',
            onPressed: () => favorites.toggleArtisan({
              'id': widget.artisanId,
              'name': artisanName,
              'subtitle': artisanLocation,
            }),
            icon: Icon(isFavorite ? Icons.favorite : Icons.favorite_border, color: Colors.redAccent),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _savingRating ? null : _openRatingDialog,
        icon: const Icon(Icons.rate_review_outlined),
        label: const Text('Noter'),
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _loading
            ? const LoadingListView(itemCount: 5)
            : _error.isNotEmpty && _details.isEmpty
                ? ErrorStateView(
                    message: _error,
                    onRetry: _load,
                    title: 'Impossible de charger cet artisan',
                  )
            : ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  if (_error.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Text(_error, style: const TextStyle(color: Colors.red)),
                    ),
                  Card(
                    child: ListTile(
                      title: Text(artisanName),
                      subtitle: Text(artisanLocation),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text('Produits (${products.length})', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 6),
                  if (products.isEmpty)
                    const EmptyStateView(
                      message: 'Aucun produit publié.',
                      icon: Icons.inventory_2_outlined,
                    ),
                  ...products.map((item) {
                    final product = item as Map<String, dynamic>;
                    final images = ((product['images'] as List<dynamic>?) ?? <dynamic>[]).map((image) => image.toString()).toList();
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
                        trailing: Text('${(product['price'] ?? 0).toString()} €'),
                        isThreeLine: true,
                      ),
                    );
                  }),
                  const SizedBox(height: 10),
                  Text('Avis ($count) - Moyenne: $average / 5', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 6),
                  if (ratingItems.isEmpty)
                    const EmptyStateView(
                      message: 'Aucun avis pour le moment.',
                      icon: Icons.reviews_outlined,
                    ),
                  ...ratingItems.map((item) {
                    final rating = item as Map<String, dynamic>;
                    final userName = (rating['userId']?['name'] ?? 'Utilisateur').toString();
                    final score = (rating['rating'] ?? 0).toString();
                    final comment = (rating['comment'] ?? '').toString();
                    final authorId = (rating['userId']?['_id'] ?? '').toString();
                    final canManage = session.isAuthenticated && session.userId == authorId;
                    return Card(
                      child: ListTile(
                        title: Text('$userName · $score/5'),
                        subtitle: Text(comment.isEmpty ? 'Sans commentaire' : comment),
                        trailing: canManage
                            ? Wrap(
                                spacing: 2,
                                children: [
                                  IconButton(
                                    tooltip: 'Modifier',
                                    onPressed: _savingRating ? null : () => _openEditRatingDialog(rating),
                                    icon: const Icon(Icons.edit_outlined),
                                  ),
                                  IconButton(
                                    tooltip: 'Supprimer',
                                    onPressed: _savingRating ? null : () => _deleteRating(rating),
                                    icon: const Icon(Icons.delete_outline),
                                  ),
                                ],
                              )
                            : null,
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
