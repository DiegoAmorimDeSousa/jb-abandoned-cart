import { json } from 'co-body'

import { mapProducts, mapSkus } from '../utils/products'

interface AbandonedCart {
  skuURL: string
  email: string
  template: string
  rclastcart: string
  homePhone: string
  accountName: string
  additionalFields: any
}

export async function abandonedCart(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { 
      catalog: catalogClient,
      journeyBuilder: JourneyBuilderClient
    },
  } = ctx

  const body: AbandonedCart = await json(ctx.req)

  const skus = mapSkus(body.skuURL)
  const products = await catalogClient.getProducts(skus)

  const items = mapProducts(products, skus).filter(
    value =>
      value.availabilityQuantity !== undefined && value.availabilityQuantity > 0
  )

  const url = `https://${body.accountName}.myvtex.com/checkout/${body.rclastcart}`

  console.log('email do cliente da loja: ', body.email);
  console.log('link do carrinho: ', url)
  console.log('account name', body.accountName)
  console.log('telefone: ', body.homePhone)
  console.log('items', items)
  console.log('additionalFields', body.additionalFields)

  const userObject = {
    storeClientEmail: body.email,
    urlCart: url,
    storeAcountName: body.accountName,
    storeUserPhoneNumber: body.homePhone,
  }

  const createCart = await JourneyBuilderClient.createCart(userObject);

  ctx.status = 200
  ctx.body = createCart;

  await next()
}
