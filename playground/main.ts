// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface User {
  name: string
  age: number
  gender: 'male' | 'female' | '🤖'
}

document.getElementById('app')!.innerHTML = Untype('User').definition
