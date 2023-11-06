import { initInstrumentation } from '@/faro/faro';
import '@/styles/globals.css'
import type { AppProps } from 'next/app'

initInstrumentation();

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
