type Guest = 'guest'
type Admin = 'admin' | 'superadmin'
type User = 'user' | Guest | Admin

document.getElementById('app')!.innerHTML = Untype<User>('User').definition
