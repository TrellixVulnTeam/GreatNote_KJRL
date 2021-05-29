import { MongoClient, ObjectId, Collection} from "mongodb"

const notebookDataBaseName = "GreatNote"
let mainDocArrayName = [
  "mainArray_pageFull", "mainArray_pageOverview", "mainArray_bookmark", "mainArray_pokemon", "mainArray_panel"
]

let rootNode = {
    GNType: "None",
    data: {},
    stylesheet: {},
    _identity: {
      parentAccessPointer: "",
      children: [],
      accessPointer: "00000-00000",
      dataPointer: "00000-00000",
      linkedArray: ["00000-00000"]
    }
}

function createUniqueID():string{
  let temporaryPointer =  `${Date.now().toString(36) + Math.random().toString(36).substr(2)}`

  return temporaryPointer
}

interface ItemToBeAddedInterface {
    arrayAccessIDChain: string[],
    itemArray: any[]
}

export interface MongoBackEndInterface {
  connect():any
  disconnect():void

  createNewNoteBook(notebookInfo: any): void
  deleteNoteBook(notebookID: string): void

  initializeFirstNotebook(notebookID: string):any
  testConnection():void
  getOverallNotebookData():any
  recursiveGetChildNodeData(collection:Collection, nodeData: any, level?: number)


  getItem(collection: Collection, databaseMessage: any): void
  createItem(collection: Collection, databaseMessage: any): void
  updateItem(collection: Collection, databaseMessage: any): void
}


export class MongoBackEnd implements MongoBackEndInterface {
  mongoUrl: string
  client: any
  collection: any

    constructor(){
        this.mongoUrl = "mongodb://localhost:27017"
        this.client = null
        this.collection = null
    }

    async testConnection(){
        let mongoClient = await this.connect()
        const database =  mongoClient.db(notebookDataBaseName)
        let allNotebookDB = database.collection("allNotebookDB")
        let result = await allNotebookDB.findOne({})
        await this.client.close()
        return result
    }

    async createNewNoteBook(notebookInfo: {notebookID: string, notebookName: string}){
        let mongoClient = await this.connect()
        const database =  mongoClient.db(notebookDataBaseName)

        // this is a particular notebook
        let newNotebookDB = database.collection(notebookInfo.notebookID)
        await newNotebookDB.insertOne(notebookInfo)


        // this is tthe overall
        let overallNoteBookInfoDB = database.collection("overallNoteBookInfoDB")

        await overallNoteBookInfoDB.insertOne(notebookInfo)


        await this.disconnect()
    }

    async deleteNoteBook(notebookID: string){
        let mongoClient = await this.connect()
        const database =  mongoClient.db(notebookDataBaseName)

        // this is a particular notebook
        let newNotebookDB = database.collection(notebookID)
        await newNotebookDB.drop()

        // this is tthe overall
        let overallNoteBookInfoDB = database.collection("overallNoteBookInfoDB")
        overallNoteBookInfoDB.deleteOne({notebookID: notebookID})

        await this.disconnect()
    }

    async getOverallNotebookData(){
      let mongoClient = await this.connect()
      const database =  mongoClient.db(notebookDataBaseName)
      let overallNoteBookInfoDB = database.collection("overallNoteBookInfoDB")

      return await overallNoteBookInfoDB.find({}, {
        projection: {notebookName: 1, notebookID: 1, _id: 0}
      }).toArray()
    }

    async createEmptyNotebook(collection){
        await collection.insertOne(rootNode)

        let mainArrayNodes = await mainDocArrayName.map(async p=>{
          let uniqueID = createUniqueID()
          let htmlObjectData = {
            GNType: p,
            data: {},
            array: [],
            stylesheet: {},
            _classNameList: [],
            _identity: {
              parentAccessPointer: rootNode._identity.accessPointer,
              children: [],
              accessPointer: uniqueID, dataPointer: uniqueID,
              linkArray: [uniqueID]
            }
          } // return object

          let databaseMessage = this.createDatabaseMessage("create", htmlObjectData)
          console.log(90909090, databaseMessage)

          await this.createItem(collection, databaseMessage)
        })// map
    }

    async initializeFirstNotebook(notebookID:string){
        console.log(125125, notebookID)
        let mongoClient = await this.connect()
        const database =  mongoClient.db(notebookDataBaseName)
        let allNotebookDB = database.collection(notebookID)
        let count = await allNotebookDB.countDocuments()

        // await allNotebookDB.drop()
        if (count <= 1) await this.createEmptyNotebook(allNotebookDB)

        return await this.getInitializeNotebookData(allNotebookDB)
    } // initializeFirstNotebook

    async getItem(collection: Collection, databaseMessage: any){
      return await collection.findOne(databaseMessage.accessPinter)
    }


    async createItem(collection: Collection, databaseMessage: any){

      console.log(129129, databaseMessage, databaseMessage.htmlObjectData)

      await collection.insertOne( databaseMessage.htmlObjectData) // insertOne

      if (!databaseMessage.metaData.insertPosition){
          await collection.updateOne(
            {
              "_identity.accessPointer":  databaseMessage.metaData.parentAccessPointer
            }, // _identity.accessPointer
            {
              "$push": {"_identity.children": databaseMessage.metaData.accessPointer}
            } // push
          )// updateONes
      } else {
          await collection.updateOne(
            {
              "_identity.accessPointer":  databaseMessage.metaData.parentAccessPointer
            }, // _identity.accessPointer
            {
              $push: {
                "_identity.children": {
                  $each: [ databaseMessage.metaData.accessPointer],
                  $position: databaseMessage.metaData.insertPosition
                }
              } // #push
            } // 2nd argumement
          )// updateONes
      }

    } // createItem

    async updateItem(collection: Collection, databaseMessage: any){
      await collection.updateOne(
        {
          "_identity.accessPointer":  databaseMessage.htmlObjectData._identity.accessPointer
        },
        {
          "$set": {
              "_classNameList": databaseMessage.htmlObjectData._classNameList,
              "data": databaseMessage.htmlObjectData.data,
              "stylesheet": databaseMessage.htmlObjectData.stylesheet
          }
        }
      )// updateONes
    } // updateItem

    async deleteItem(collection, databaseMessage){
      await collection.remove({
        "_identity.accessPointer":  databaseMessage.metaData.accessPointer
      })

      await collection.update({
        "_identity.accessPointer": databaseMessage.metaData.parentAccessPointer},
        {"$pull": {"_identity.children": databaseMessage.metaData.accessPointer}}
      )
    } // deleteItem

    createDatabaseMessage(action: string, htmlObjectData: any){

        let parentAccessPointer = htmlObjectData._identity.parentAccessPointer
        let accessPointer = htmlObjectData._identity.accessPointer
        let dataPointer = htmlObjectData._identity.dataPointer


        let databaseMessage = {
            htmlObjectData: htmlObjectData,
            metaData: {
                action: action,
                insertPosition: null,
                parentAccessPointer: parentAccessPointer,
                accessPointer: accessPointer,
                dataPointer: dataPointer
            }
        }

        return databaseMessage
    }

    async recursiveGetChildNodeData(collection, nodeData, level){
      nodeData.array = []
      if (nodeData._identity.children.length > 0 && level != 0){
          if (level) level -= 1

          let childNodeArray =  nodeData._identity.children.map(async p=>{
              let childNodeData = await collection.findOne({"_identity.accessPointer": p})

              return await this.recursiveGetChildNodeData(collection, childNodeData, level)
          })

          return Promise.all(childNodeArray).then(p=>{
              nodeData.array = p
              return nodeData
          })
      } else {
          return nodeData
      } // nodeData._identity.children.length > 0
      // console.log(176176, nodeData)
    }

    async getChildNodeData(collection, nodeData){
        nodeData.array = []
        if (nodeData._identity.children.length > 0){
            let childNodeArray =  nodeData._identity.children.map(async p=>{
                let childNodeData = await collection.findOne({"_identity.accessPointer": p})

                return childNodeData
            })

            return Promise.all(childNodeArray).then(p=>{
                nodeData.array = p
                return nodeData
            })
        }
    } // getChildNodeData

    async getInitializeNotebookData(collection){
        let rootNode = await collection.findOne({ "_identity.accessPointer": "00000-00000" })
        rootNode["array"] = []

        let result = await this.recursiveGetChildNodeData(collection, rootNode, 3)
        console.log(result)

        return await rootNode
    }
    // async getInitializeNotebookData(collection){
    //     let rootNode = await collection.findOne({ "_identity.accessPointer": "00000-00000" })
    //     rootNode["array"] = []
    //
    //     let childNodeArray =  rootNode._identity.children.map(async p=>{
    //         let mainArrayNode = await collection.findOne({"_identity.accessPointer": p})
    //
    //         mainArrayNode = await this.getChildNodeData(collection, mainArrayNode)
    //         // console.log(262262, mainArrayNode)
    //
    //         mainArrayNode.array.forEach(q=>{
    //           console.log(267267, q)
    //         })
    //
    //         return mainArrayNode
    //
    //     })
    //     // console.log(270270, childNodeArray)
    //
    //     rootNode = await this.getChildNodeData(collection, rootNode)
    //
    //
    //
    //     return await rootNode
    // }

    // async getInitializeNotebookData(collection){
    //     let initializeNotebookData = await collection.findOne({
    //       "_identity.accessPointer": "00000-00000"
    //     })
    //
    //     let childNodeArray =  nodeData._identity.children.map(async p=>{
    //         let childNodeData = await collection.findOne({"_identity.accessPointer": p})
    //
    //         return await this.getChildNodeData(collection, childNodeData)
    //     })
    //
    //     return Promise.all(childNodeArray).then(p=>{
    //         nodeData.array = p
    //         return nodeData
    //     })
    //
    //
    //     return await this.getChildNodeData(collection, initializeNotebookData)
    // }

    async connect(){
        const mongoClient = new MongoClient(this.mongoUrl, {
          // useUnifiedTopology: true,
          useNewUrlParser: true
        })

        console.info("connection to MongoDB")
        return await mongoClient.connect()
    }


    async disconnect(){
        if (this.client) return this.client.close()
        console.log("The mongoClient is closed.")

        return false
    }


}
