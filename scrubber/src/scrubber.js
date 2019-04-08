
/* Scrubber
 * Central logic for scrubbing sensitive data from BCDevEx databases
 */

const faker = require('faker')
const MongoClient = require('mongodb').MongoClient
const mongoTools = require('./mongoTools')

const tmpFile = '/tmp/tmp.gz'

// Collections that don't contain sensitive data fields
const collectionWhitelist = [
  'capabilities',
  'capabilityskills',
  'configuration',
  'messagetemplates',
  'notifications',
  'projects',
  'sessions',
  'skills',
  'subscriptions',
  'teams'
]

const scrubberMap = {

  attachments: () => ({
    name: faker.system.commonFileName()
  }),

  messagearchives: () => ({
    userEmail: uniqueDefaultEmail(),
    messageBody: '',
    messageShort: '',
    messageTitle: '',
    emailBody: '',
    emailSubject: ''
  }),

  messages: () => ({
    userEmail: uniqueDefaultEmail(),
    messageBody: '',
    messageShort: '',
    messageTitle: '',
    emailBody: '',
    emailSubject: ''
  }),

  opportunities: () => ({
    proposalEmail: uniqueDefaultEmail()
  }),

  orgs: () => ({
    name: faker.company.companyName(),
    dba: faker.name.findName(),
    address: faker.address.streetAddress(),
    address2: faker.address.secondaryAddress(),
    city: faker.address.city(),
    province: 'BC',
    postalcode: '1A1 A1A',
    fullAddress: faker.address.streetAddress(),
    contactName: faker.name.findName(),
    contactEmail: uniqueDefaultEmail(),
    contactPhone: faker.phone.phoneNumber(),
    website: '',
    orgImageURL: ''
  }),

  profiles: () => ({
    github: '',
    stackOverflow: '',
    stackExchange: '',
    linkedIn: '',
    website: ''
  }),

  programs: () => ({
    owner: ''
  }),

  proposals: () => ({
    businessName: faker.company.companyName(),
    businessAddress: faker.address.streetAddress(),
    businessContactName: faker.name.findName(),
    businessContactEmail: uniqueDefaultEmail(),
    businessContactPhone: faker.phone.phoneNumber()
  }),

  users: () => ({
    firstName: uniqueFirstName(),
    lastName: uniqueLastName(),
    displayName: `${uniqueFirstName()} ${uniqueLastName()}`,
    username: uniqueUserName(),
    email: uniqueDefaultEmail(),
    address: faker.address.streetAddress(),
    phone: faker.phone.phoneNumber(),
    businessAddress2: faker.address.secondaryAddress(),
    businessCity: faker.address.city(),
    businessProvince: 'BC',
    businessCode: '',
    profileImageURL: '',
    providerData: '',
    businessName: faker.company.companyName(),
    businessAddress: faker.address.streetAddress(),
    businessContactName: faker.name.findName(),
    businessContactEmail: uniqueDefaultEmail(),
    businessContactPhone: faker.phone.phoneNumber(),
    github: '',
    stackOverflow: '',
    stackExchange: '',
    linkedIn: '',
    website: ''
  })

}

const uniqueDefaultEmail = (() => {
  let count = 0
  return () => `bcdevelopersexchange${'+' + ++count}@gmail.com`
})()

const uniqueFirstName = (() => {
  const firstNames = new Set()
  return () => {
    let firstName
    do firstName = faker.name.firstName()
    while (firstNames.has(firstName))
    firstNames.add(firstName)
    return firstName
  }
})()

const uniqueLastName = (() => {
  const lastNames = new Set()
  return () => {
    let lastName 
    do lastName = faker.name.lastName()
    while (lastNames.has(lastName))
    lastNames.add(lastName)
    return lastName
  }
})()

const uniqueUserName = (() => {
  const userNames = new Set()
  return () => {
    let userName 
    do userName = faker.internet.userName()
    while (userNames.has(userName))
    userNames.add(userName)
    return userName
  }
})()

async function scrubCollections(collections) {

  const sensitiveCollections = collections
  .filter(c => collectionWhitelist.indexOf(c.collectionName) === -1)

  console.log('Found', sensitiveCollections.length, 'sensitive collections')

  for (const collection of sensitiveCollections) {

    console.log('Scrubbing', collection.collectionName)
    const scrubbedFields = scrubberMap[collection.collectionName]()
    const fieldNames = Object.keys(scrubbedFields)

    // Query all docs with a scrubbable field
    const filterQuery = {
      $or: fieldNames.map(field => ({
        [field]: { $exists: true } 
      })) 
    }

    // However, do not include these users
    if (collection.collectionName === 'users') {
      const skippedUsers = ['admin', 'dev', 'gov', 'user']
      filterQuery.$and = skippedUsers.map(user => ({
        username: { $ne: user } 
      }))
    }

    const updates = []
    const cursor = collection.find(filterQuery)

    while (await cursor.hasNext()) {
      const doc = await cursor.next()
      const scrubbedFields = scrubberMap[collection.collectionName]()
      updates.push({
        updateOne: {
          filter: { _id : doc._id },
          update: { $set: scrubbedFields }
        }
      })
    }

    // Update all of the documents as a single bulk request
    const result = await collection.bulkWrite(updates)

    console.log('\nCollection:', collection.collectionName)
    console.log('Found', result.matchedCount, 'sensitive entries')
    console.log('Scrubbed', result.modifiedCount, 'entries')

  }

}

async function scrubber(srcUri, tmpUri, outFile) {
  const opts = { useNewUrlParser: true }
  const client = await MongoClient.connect(tmpUri, opts)
  try {
    console.log('Scrubbing database')
    await client.db().dropDatabase()
    await mongoTools.dump(srcUri, tmpFile)
    await mongoTools.restore(tmpFile, tmpUri)
    const collections = await client.db().collections()
    if (!collections.length) throw new Error('No collections found')
    await scrubCollections(collections)
    await mongoTools.dump(tmpUri, outFile)
    await client.db().dropDatabase()
    await client.close()
  } catch (e) {
    await client.db().dropDatabase() 
    await client.close()
    throw e
  }
}

module.exports = scrubber
