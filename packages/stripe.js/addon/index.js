import config from '@ascua/config';
import Stripe from 'stripe';

const stripe = Stripe && Stripe(config.stripe && config.stripe.publishableKey);

export default stripe;