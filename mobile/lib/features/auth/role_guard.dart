import 'package:flutter/material.dart';
import '../../core/auth/session_scope.dart';

class RoleGuard extends StatelessWidget {
  final String requiredRole;
  final Widget child;

  const RoleGuard({super.key, required this.requiredRole, required this.child});

  @override
  Widget build(BuildContext context) {
    final session = SessionScope.of(context);

    if (!session.isReady) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (!session.isAuthenticated) {
      return Scaffold(
        appBar: AppBar(title: const Text('Accès protégé')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Tu dois te connecter pour accéder à cette section.'),
                const SizedBox(height: 12),
                FilledButton(
                  onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
                  child: const Text('Aller à la connexion'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (session.role != requiredRole) {
      return Scaffold(
        appBar: AppBar(title: const Text('Accès refusé')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('Ton rôle (${session.role}) ne permet pas cet accès.'),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () => Navigator.pushReplacementNamed(context, '/'),
                  child: const Text('Retour accueil'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return child;
  }
}
