import { handler } from './index.mjs'
const start = async () => {
    const response = await 
handler({ section: 'feed' })
    console.log(response)
}
start()

// GENRES:

// 'brooklyn'
// 'london'
// 'montreal'
// 'tel-aviv'

// 'alternative'
// 'electro-pop'
// 'synth pop'
// 'hardcore'
// 'hip-hop'
// 'house'
// 'daily'
// 'trap'
// 'pop'

// 'daily'
// 'feed'