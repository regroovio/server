import { handler } from './index.mjs'
const start = async () => {
    const response = await handler(
        {
            genre: 'trap',
            executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        }
    )
    console.log(response)
}
start()