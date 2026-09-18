const {exec} = require('child_process');
const path = require('path');

exports.restoreBackup= (folderName)=>{
    const backUpPath = path.join(__dirname,'..','backups',folderName,process.env.DB_NAME);

    const db_uri = process.env.DB_URI;

    const command = `mongorestore --uri="${db_uri}" --drop --gzip "${backUpPath}"`;

    exec(command, (error,stdout,stderr)=>{
        if(error){
            console.log(`DB Restore Error | ${error.message}`)
        }
        else{
            console.log('Database restored')
        }
    })
}