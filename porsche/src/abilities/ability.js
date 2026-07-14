import { AbilityBuilder, createMongoAbility } from '@casl/ability';
 
export function defineAbilityFor(user) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
 
  if (!user) {
    can('read', 'Car');
    can('read', 'Shop');
    cannot('purchase', 'Shop');
    cannot('book', 'TestDrive');
    cannot('read', 'Dashboard');
    return build();
  }
 
  const role = user.role ?? 'user';
 
  if (role === 'user') {
    can('read',      'Car');
    can('configure', 'Car');
    can('read',      'Shop');
    can('purchase',  'Shop');
    can('book',      'TestDrive');
    can('cancel',    'TestDrive', { userId: user.id });
    can('read',      'Profile',   { userId: user.id });
    can('update',    'Profile',   { userId: user.id });
    cannot('read',   'Dashboard');
  }
 
  if (role === 'dealer') {
    can('manage', 'Car');
    can('manage', 'TestDrive');
    can('read',   'User');
    can('read',   'Order');
    can('read',   'Dashboard');
    can('read',   'Shop');
    cannot('manage', 'User');
    cannot('manage', 'Order');
  }
 
  if (role === 'manager') {
    can('manage', 'Car');
    can('manage', 'TestDrive');
    can('manage', 'Order');
    can('read',   'User');
    can('update', 'User');
    can('manage', 'Shop');
    can('manage', 'Dashboard');
    cannot('delete', 'User');
  }
 
  if (role === 'admin') {
    can('manage', 'all');
  }
 
  return build();
}
 
export const ability = createMongoAbility([]);
 
export function updateAbility(user) {
  const newAbility = defineAbilityFor(user);
  ability.update(newAbility.rules);
}