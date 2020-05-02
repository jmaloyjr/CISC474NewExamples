import express, { RequestHandler } from 'express';
import { ProjectsModel } from './projectsModel';
import { Database } from '../common/MongoDB';
import { Config } from '../config';
import { request } from 'http';
//import { http, https} from 'follow-redirects';
//This is just an example of a second controller attached to the security module

export class ProjectsController {
    static db: Database = new Database(Config.url, "projects");
    static projectsTable = 'projects';
    getHello(req: express.Request, res: express.Response) {
        //https://wanago.io/2019/03/18/node-js-typescript-6-sending-http-requests-understanding-multipart-form-data/
        //getaddrinfo ENOTFOUND https://energ.ee/covid19-us-api/states.json
        //IncomingMessage {_readableState: ReadableState, readable: true, _events: Object, _eventsCount: 1, _maxListeners: undefined, …}
        //https://stackoverflow.com/questions/7323932/how-do-you-follow-an-http-redirect-in-node-js
        /*const data = request(
            {
              host: 'energ.ee',
              path: '/covid19-us-api/states.json',
              method: 'GET',
            },
            response => {
              console.log(response.statusMessage); // 200
              res.send(response.statusCode);
            }
          );
           
        data.end();
        */
       var http = require('follow-redirects').http;
       var opts = {host: 'energ.ee', path:'/covid19-us-api/states.json'};
       http.get(opts, (resp: express.Response) => {
         var page = '';
         resp.on('data', (chunk) => {
           page += chunk;
         });
         resp.on('end', function() {
            res.send(page);
         });
        });
        //yarn add follow-redirects
        //npm install follow-redirects

        //res.send("GURTHQUAKE");
    }
    
    //getProjects
    //sends a json object with all projects in the system that match :year
    getProjects(req: express.Request, res: express.Response) {
        const semester = req.params.semester;
        ProjectsController.db.getRecords(ProjectsController.projectsTable, { semester: semester })
            .then((results) => res.send({ fn: 'getProjects', status: 'success', data: results }).end())
            .catch((reason) => res.status(500).send(reason).end());

    }
    //getProject
    //sends the specific project as JSON with id=:id
    getProject(req: express.Request, res: express.Response) {
        const semester = req.params.semester;
        const id = Database.stringToId(req.params.id);
        ProjectsController.db.getOneRecord(ProjectsController.projectsTable, { _id: id, semester: semester })
            .then((results) => res.send({ fn: 'getProject', status: 'success', data: results }).end())
            .catch((reason) => res.status(500).send(reason).end());
    }
    //addProject
    //adds the project to the database
    addProject(req: express.Request, res: express.Response) {
        const proj: ProjectsModel = ProjectsModel.fromObject(req.body);

        ProjectsController.db.addRecord(ProjectsController.projectsTable, proj.toObject())
            .then((result: boolean) => res.send({ fn: 'addProject', status: 'success' }).end())
            .catch((reason) => res.status(500).send(reason).end());
    }

    //updateProject
    //updates the project in the database with id :id
    updateProject(req: express.Request, res: express.Response) {
        const id = Database.stringToId(req.params.id);
        const data = req.body;
        delete data.authUser;
        ProjectsController.db.updateRecord(ProjectsController.projectsTable, { _id: id }, { $set: req.body })
            .then((results) => results ? (res.send({ fn: 'updateProject', status: 'success' })) : (res.send({ fn: 'updateProject', status: 'failure', data: 'Not found' })).end())
            .catch(err => res.send({ fn: 'updateProject', status: 'failure', data: err }).end());

    }
    //deleteProject
    //deletes the project int he database with id :id
    deleteProject(req: express.Request, res: express.Response) {
        const id = Database.stringToId(req.params.id);
        ProjectsController.db.deleteRecord(ProjectsController.projectsTable, { _id: id })
            .then((results) => results ? (res.send({ fn: 'deleteProject', status: 'success' })) : (res.send({ fn: 'deleteProject', status: 'failure', data: 'Not found' })).end())
            .catch((reason) => res.status(500).send(reason).end());
    }
    //getSemesters
    //returns all valid unique semesters in the database
    getSemesters(req: express.Request, res: express.Response) {
        ProjectsController.db.getRecords(ProjectsController.projectsTable)
            .then(results => {
                //extracts just the semester
                let semesters = results.map((x: any) => x.semester);
                //removes duplciates
                semesters = semesters.filter((value: string, index: number, array: any[]) =>
                    !array.filter((v, i) => value === v && i < index).length);
                res.send({ fn: 'deleteProject', status: 'success', data: { semesters: semesters } })
            })
            .catch((reason) => res.status(500).send(reason).end());
    }
    //getProjectNumbers
    //returns all valid unique projectNumbers for a given semesters in the database
    getProjectNumbers(req: express.Request, res: express.Response) {
        const semester = req.params.semester;
        ProjectsController.db.getRecords(ProjectsController.projectsTable,{semester:semester})
            .then(results => {
                //extracts just the projectNumber
                let projects = results.map((x: any) => x.projectNumber);
                //removes duplciates
                projects = projects.filter((value: number, index: number, array: any[]) =>
                    !array.filter((v, i) => value === v && i < index).length);
                res.send({ fn: 'deleteProject', status: 'success', data: { projectNumbers:projects.sort()} });
            })
            .catch((reason) => res.status(500).send(reason).end());
    }

}