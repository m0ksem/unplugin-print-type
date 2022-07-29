type Guest = 'guest'
type Admin = 'admin' | 'superadmin'
type Role = 'user' | Guest | Admin

interface User {
  role: Role
  username: string
}

type Project = {
  name: string
  owner: User
}

document.getElementById('app')!.innerHTML = Untype<Project>('Project').definition
