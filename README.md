# SAME

## Paiements

Le site utilise des fonctions Netlify pour créer les sessions Stripe et PayPal. Les prix, tailles et frais de livraison sont recalculés côté serveur. Les clés secrètes ne doivent jamais être ajoutées au code ni partagées dans un message.

1. Importer le dépôt dans Netlify ; `netlify.toml` configure les fonctions et la publication.
2. Dans les variables d’environnement Netlify, ajouter `STRIPE_SECRET_KEY` avec une clé Stripe de test et `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` avec les identifiants de sandbox PayPal.
3. Ajouter `PAYPAL_ENV=sandbox` pour les essais. Laisser `SITE_URL` vide sur Netlify afin d’utiliser l’URL du site fournie automatiquement.
4. Tester une commande avec les moyens de paiement de test Stripe et PayPal sandbox.
5. Pour vendre réellement, remplacer les identifiants de test par les identifiants live dans les paramètres sécurisés de Netlify. Activer Apple Pay et les moyens supplémentaires dans Stripe ; le domaine de production doit être en HTTPS et enregistré auprès de Stripe pour Apple Pay.

Stripe Checkout demande une adresse de facturation et une adresse de livraison en France. PayPal recueille l’adresse de livraison dans son parcours de paiement.