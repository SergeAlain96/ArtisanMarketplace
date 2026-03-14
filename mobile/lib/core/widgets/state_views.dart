import 'package:flutter/material.dart';

class LoadingListView extends StatelessWidget {
  final int itemCount;
  final bool showToolbarStub;

  const LoadingListView({
    super.key,
    this.itemCount = 4,
    this.showToolbarStub = false,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      children: [
        if (showToolbarStub) ...[
          const _SkeletonBox(height: 54),
          const SizedBox(height: 10),
          const _SkeletonBox(height: 54),
          const SizedBox(height: 12),
        ],
        ...List.generate(
          itemCount,
          (index) => const Padding(
            padding: EdgeInsets.only(bottom: 12),
            child: _SkeletonCard(),
          ),
        ),
      ],
    );
  }
}

class ErrorStateView extends StatelessWidget {
  final String message;
  final Future<void> Function() onRetry;
  final String title;

  const ErrorStateView({
    super.key,
    required this.message,
    required this.onRetry,
    this.title = 'Une erreur est survenue',
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(24),
      children: [
        const SizedBox(height: 48),
        Icon(Icons.error_outline, size: 52, color: Theme.of(context).colorScheme.error),
        const SizedBox(height: 16),
        Text(title, textAlign: TextAlign.center, style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 8),
        Text(
          message,
          textAlign: TextAlign.center,
          style: TextStyle(color: Theme.of(context).colorScheme.error),
        ),
        const SizedBox(height: 16),
        Center(
          child: FilledButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: const Text('Réessayer'),
          ),
        ),
      ],
    );
  }
}

class EmptyStateView extends StatelessWidget {
  final String message;
  final IconData icon;

  const EmptyStateView({
    super.key,
    required this.message,
    this.icon = Icons.inbox_outlined,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Column(
        children: [
          Icon(icon, size: 40, color: Theme.of(context).colorScheme.outline),
          const SizedBox(height: 10),
          Text(message, textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

class _SkeletonCard extends StatelessWidget {
  const _SkeletonCard();

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme.surfaceContainerHighest.withOpacity(0.7);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(height: 18, width: 140, decoration: _box(color)),
            const SizedBox(height: 10),
            Container(height: 14, width: double.infinity, decoration: _box(color)),
            const SizedBox(height: 8),
            Container(height: 14, width: 180, decoration: _box(color)),
          ],
        ),
      ),
    );
  }

  BoxDecoration _box(Color color) {
    return BoxDecoration(color: color, borderRadius: BorderRadius.circular(12));
  }
}

class _SkeletonBox extends StatelessWidget {
  final double height;

  const _SkeletonBox({required this.height});

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme.surfaceContainerHighest.withOpacity(0.7);
    return Container(
      height: height,
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(14)),
    );
  }
}
