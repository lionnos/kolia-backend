import { useEffect } from 'react';
import { useCart } from '../contexts/CartContext';

export const useCartTimeout = () => {
  const { items, lastCartUpdate } = useCart();

  useEffect(() => {
    if (items.length === 0) return;

    const checkCartTimeout = () => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastCartUpdate;
      const fifteenMinutes = 15 * 60 * 1000;

      if (timeSinceLastUpdate >= fifteenMinutes && items.length > 0) {
        // Afficher la notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Commande en attente', {
            body: 'Vous n\'avez pas encore terminé votre commande. Vos plats vous attendent!',
            icon: '/favicon.ico'
          });
        } else if ('Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('Commande en attente', {
                body: 'Vous n\'avez pas encore terminé votre commande. Vos plats vous attendent!',
                icon: '/favicon.ico'
              });
            }
          });
        }
      }
    };

    // Vérifier immédiatement au chargement
    checkCartTimeout();

    // Vérifier périodiquement (toutes les minutes)
    const intervalId = setInterval(checkCartTimeout, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [items, lastCartUpdate]);
};