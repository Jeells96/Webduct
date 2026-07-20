import { NotificationType } from '@webduct/shared';
import { CreateOrderDto } from './dto/create-order.dto';

/** Server-side mirror of the wizard's cross-field validation rules. */
export function validateOrder(dto: CreateOrderDto): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  const add = (section: string, msg: string) => {
    (errors[section] ??= []).push(msg);
  };

  // Shipping: delivery window start must precede end.
  if (dto.deliveryWindowStart && dto.deliveryWindowEnd) {
    if (new Date(dto.deliveryWindowStart) >= new Date(dto.deliveryWindowEnd)) {
      add('shipping', 'Delivery window start must be before the end time.');
    }
  }

  // Notifications: each recipient must be unique and well-formed for its type.
  const seen = new Set<string>();
  for (const n of dto.notifications ?? []) {
    let key: string | undefined;
    if (n.type === NotificationType.Email) {
      if (!n.email) {
        add('notifications', 'Email recipients require an email address.');
        continue;
      }
      key = `EMAIL:${n.email.toLowerCase()}`;
    } else if (n.type === NotificationType.User) {
      if (!n.userId) {
        add('notifications', 'User recipients require a user.');
        continue;
      }
      key = `USER:${n.userId}`;
    } else if (n.type === NotificationType.Crew) {
      if (!n.crewId) {
        add('notifications', 'Crew recipients require a crew.');
        continue;
      }
      key = `CREW:${n.crewId}`;
    }
    if (key) {
      if (seen.has(key)) {
        add('notifications', 'Duplicate notification recipient.');
      }
      seen.add(key);
    }
  }

  return errors;
}
