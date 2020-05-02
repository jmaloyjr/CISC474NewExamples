import express, { RequestHandler } from 'express';
import { ProjectsModel } from './projectsModel';
import { Database } from '../common/MongoDB';
import { Config } from '../config';
import { request } from 'http';
//This is just an example of a second controller attached to the security module

export class ProjectsController {
    static db: Database = new Database(Config.url, "projects");
    static projectsTable = 'projects';

    getCovidData(req: express.Request, res: express.Response) {
        var http = require('follow-redirects').http;
        var opts = { host: 'energ.ee', path: '/covid19-us-api/states.json' };
        http.get(opts, (apires: express.Response) => {
            var page = '';
            //var json = null;
            apires.on('data', (chunk) => {
                page += chunk;
            });
            apires.on('end', function () {
                res.send(JSON.parse(page));
            });
        });

    }
    
    getStateData(req: express.Request, res: express.Response) {
        var state = req.params['state'];
        state = state.charAt(0).toUpperCase() + state.slice(1); //ensure first letter is capital

        var http = require('follow-redirects').http;
        var opts = { host: 'energ.ee', path: '/covid19-us-api/states.json' };
        http.get(opts, (apires: express.Response) => {
            var page = '';
            apires.on('data', (chunk) => {
                page += chunk;
            });
            apires.on('end', function () {
                res.send(JSON.parse(page)[state]);
            });
        });
    }

}