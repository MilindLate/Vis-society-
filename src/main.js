import 'intersection-observer' // polyfill for scrollama
import './styles/global.css'
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app'),
})

export default app
