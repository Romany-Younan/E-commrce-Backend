const {createBackup} = require('../services/backup.service');
const {restoreBackup} = require('../services/restore.service');
exports.createBackUp = (req,res)=>{
   try
   {
    createBackup();
    res.status(204).json();
   }
   catch(err){
res.status(500).json({message:'error',error:err.message})
   }
}

exports.restoreDB = (req,res)=>{
try{
   const {folderName} = req.body;
restoreBackup(folderName);
res.status(200).json({message : 'database restored'});
}
catch(err){
   res.status(500).json({message:'error',error:err.message});
}

}