import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const prisma = new PrismaClient();

export class PaymentService {
  // Checkout-Session erstellen
  async createCheckoutSession(userId: string, priceId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('Benutzer nicht gefunden');
      }

      const session = await stripe.checkout.sessions.create({
        customer_email: user.email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
        metadata: {
          userId,
        },
      });

      return session;
    } catch (error) {
      console.error('Fehler beim Erstellen der Checkout-Session:', error);
      throw error;
    }
  }

  // Webhook verarbeiten
  async handleWebhook(event: Stripe.Event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;

          if (userId) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                stripeId: session.customer as string,
                role: 'TEACHER',
              },
            });
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;

          const user = await prisma.user.findFirst({
            where: { stripeId: customerId },
          });

          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                role: 'STUDENT',
              },
            });
          }
          break;
        }
      }
    } catch (error) {
      console.error('Fehler beim Verarbeiten des Webhooks:', error);
      throw error;
    }
  }

  // Abonnement verwalten
  async manageSubscription(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user?.stripeId) {
        throw new Error('Kein Stripe-Konto gefunden');
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeId,
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      });

      return session;
    } catch (error) {
      console.error('Fehler beim Verwalten des Abonnements:', error);
      throw error;
    }
  }
}

// Singleton-Instanz
const paymentService = new PaymentService();
export default paymentService; 