import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello world')
  console.log('Response sent!')
})

app.listen(process.env.PORT ?? '9001', () => {
  console.log(`App listening on port: ${process.env.PORT ?? '9001'}`)
})