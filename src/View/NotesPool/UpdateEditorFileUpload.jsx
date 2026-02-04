import React from 'react'
import { motion } from "framer-motion";
import { HiXMark } from "react-icons/hi2";
import { FaFilePdf, FaTrash } from "react-icons/fa6";
import { FaFileAlt, FaFileExcel, FaFileWord, FaFileVideo } from "react-icons/fa";
// import { Popover, PopoverContent, PopoverHandler } from "@material-tailwind/react";

const UpdateEditorFileUpload = (props) => {

    const { files,handleDrop, handleFileChange, handleRemoveFile, handleClick, handleAllFileRemove, fileInputRef, addNoteValue, uploadProgress} = props

    const renderFilePreview = (file, index) => {
        if (file.FILE_MIME.startsWith("image/")) {
        return (
            <motion.img
            src={URL.createObjectURL(file)}
            alt={`Uploaded ${index}`}
            className="w-[100px] h-[100px] object-cover rounded-lg"
            />
        );
        } else if (file.FILE_MIME.startsWith("video/")) {
            return <FaFileVideo className="w-[100px] h-[100px] object-cover rounded-lg text-blue-500" />;
        } else {
        switch (file.FILE_MIME) {
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return <FaFileWord className="w-[100px] h-[100px] object-cover rounded-lg text-blue-500" />;
            case "application/vnd.ms-excel":
            return <FaFileExcel className="w-[100px] h-[100px] object-cover rounded-lg text-green-500" />;
            case "application/pdf":
            return <FaFilePdf className="w-[100px] h-[100px] object-cover rounded-lg text-red-500" />;
            default:
            return <FaFileAlt className="w-[100px] h-[100px] object-cover rounded-lg" />;
        }
        }
    };
  return (
    <>
      <div className="flex">
        {files?.length > 1 && 
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="flex items-center gap-2 px-2 rounded-lg bg-red-400 text-white text-[13px] cursor-pointer"
            onClick={handleAllFileRemove}
          >
            <span>Remove All</span>
            <span className="p-1 bg-white text-red-400 rounded-full text-[10px]"><FaTrash /></span>
          </motion.div>
        }
      </div>
      <div className="flex mt-[20px] flex-wrap">
        {files?.map((file, index) => (
          <div key={index} className="mr-[10px] text-center relative">
             {/* <Popover
            open={!!openPopoverIndex[index]}
            handler={setOpenPopoverIndex}
          > */}
            {/* <PopoverHandler {...triggers(index)}> */}
              <div>{renderFilePreview(file, index)}</div>
            {/* </PopoverHandler> */}
            {/* <PopoverContent {...triggers(index)} className="z-[99999] bg-gray-800 text-white p-2"> */}
              {/* {file.name} */}
            {/* </PopoverContent> */}
          {/* </Popover> */}
            <motion.span
              whileHover={{ scale: 1.2 }}
              className="absolute -top-[9px] -right-[7px] bg-red-500 p-[4px] rounded-full border-2 border-white text-white text-[12px] cursor-pointer"
              onClick={() => handleRemoveFile(index)}
            >
              <HiXMark />
            </motion.span>
            {/* {uploadProgress[file?.name] !== undefined && ( */}
              <div className="w-[80%] bg-gray-200 rounded-full h-2.5 absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2">
                <div
                  className="bg-blue-500 h-2.5 rounded-full"
                  // style={{ width: `${uploadProgress[file?.name]}%` }}
                ></div>
              </div>
             {/* )} */}
          </div>
        ))}
      </div>
    
      <div
        onClick={handleClick}
        onDrop={(e) => handleDrop(e, addNoteValue)}
        onDragOver={(e) => e.preventDefault()}
        style={{
          border: "2px dashed #ccc",
          padding: "20px",
          borderRadius: "4px",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <input
          type="file"
          multiple
          onChange={(e) => handleFileChange(e, addNoteValue)}
          ref={fileInputRef}
          className="hidden"
          id="file-input"
        />
        <p>Drop files here to upload or click to select</p>
      </div>
    </>
  )
}

export default UpdateEditorFileUpload