const {exec} = require('child_process');
const path = require('path');
const fs = require('fs');

exports.createBackup=()=>{
    const timeStamp = new Date().toISOString().replace(/[:.]/g , '-');
    const backupFolder = path.join(__dirname,'..','backups',`backup-${timeStamp}`);
    if(!fs.existsSync(backupFolder)){
        fs.mkdirSync(backupFolder,{recursive:true});

    }
    const DB_URI = process.env.DB_URI;
    const command = `mongodump --uri="${DB_URI}" --out="${backupFolder}" --gzip`;
    exec(command,(error,stout,stderr)=>{
        if(error){
            console.log(`Database backup error | ${error.message}`)
        }
        else
        {
            console.log('backup completed');
            
        }
    })
}
