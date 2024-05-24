app.get('/product', async (req, res) => {
    const page = parseInt(req.query.page)
    const size = parseInt(req.query.size)
    const cursor = productsCollection.find().skip(page * size).limit(size)
    console.log(page, size, 'dfdf');
    const result = await cursor.toArray()
    res.send(result)
  })