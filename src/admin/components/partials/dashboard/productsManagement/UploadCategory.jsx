import { showToast } from '../../../generic/Alerts';
import { toast } from 'react-toastify';
import { ApiCalls, AdminApis } from '../../../../utils';
import React, { useMemo, useState } from 'react';
import Button from '../../../generic/Buttons';
import useAuth from '../../../../hooks/UseAuth';
import { useDropzone } from 'react-dropzone';

export default function UploadCategory({ onClose, props }) {
    const auth = useAuth();
    const [uploadErrors, setUploadErrors] = useState([]);
    const [showAllErrors, setShowAllErrors] = useState(false);

    const handleToggleErrors = () => {
        setShowAllErrors(!showAllErrors);
    };

    const displayedErrors = showAllErrors ? uploadErrors : uploadErrors.slice(0, 5); // Show all errors or limit to 5

    const {
        acceptedFiles,
        fileRejections,
        getRootProps,
        getInputProps,
        isFocused,
        isDragAccept,
        isDragReject
    } = useDropzone({
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
        }
    });

    const style = useMemo(() => ({
        ...{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px',
            borderWidth: 2,
            borderRadius: 2,
            borderColor: '#eeeeee',
            borderStyle: 'dashed',
            backgroundColor: '#fafafa',
            color: '#bdbdbd',
            outline: 'none',
            transition: 'border .24s ease-in-out'
        },
        ...(isFocused ? { borderColor: '#2196f3' } : {}),
        ...(isDragAccept ? { borderColor: '#00e676' } : {}),
        ...(isDragReject ? { borderColor: '#ff1744' } : {})
    }), [
        isFocused,
        isDragAccept,
        isDragReject
    ]);

    const acceptedFileItems = acceptedFiles.map(file => (
        <li key={file.path}>
            {file.path}
        </li>
    ));

    const fileRejectionItems = fileRejections.map(({ file, errors }) => (
        <li key={file.path}>
            {file.path}
            <ul>
                {errors.map(e => (
                    <li key={e.code} className='text-red-500'>{e.code}</li>
                ))}
            </ul>
        </li>
    ));

    const uploadExcel = async (file) => {
        if (file.length === 0) {
            showToast("Please upload a file", "error", "file-not-selected")
        }
        else {
            const formData = new FormData();
            formData.append("category_file", file[0]);
            await toast.promise(
                ApiCalls(AdminApis.uploadCategory, "POST", formData, false, auth.token.access),
                {
                    pending: {
                        render() {
                            return "Uploading..."
                        },
                    },
                    success: {
                        render({ data }) {
                            if (data.data.errors.length > 0) {
                                setUploadErrors(data.data.errors)
                            }
                            return data.data.message
                        },
                    },
                    error: {
                        render({ data }) {
                            return data.data.message
                        },
                    },
                },
            )
        }
    }

    return (
        <>
            <div className="flex flex-col lg:flex-row justify-between lg:items-center my-4 space-y-2 lg:space-y-0">
                <h1 className="text-xl font-semibold mb-4">Upload Categories</h1>
                <Button
                    onClick={() => onClose(true)}
                    text="Back"
                    type="cancel"
                    py="2"
                    px="4"
                />
            </div>
            {uploadErrors.length > 0 ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded relative" role="alert">
                    <p>Errors:</p>
                    {displayedErrors.map((error, index) => (
                        <span key={index} className="block sm:inline">{error}<br /></span>
                    ))}

                    <div className="flex justify-center">
                        {uploadErrors.length > 5 && (
                            <button onClick={handleToggleErrors} className="text-blue-500 underline cursor-pointer">
                                {showAllErrors ? "Read Less" : "Read More"}
                            </button>
                        )}
                    </div>
                </div>

            ) : (null)}
            <section className="container flex justify-center items-center">
                <div {...getRootProps({ style })}>
                    <input {...getInputProps()} />
                    <div className='text-center'>
                        <p>Drag & drop file here or click to upload file</p>
                        <em>(Only *.csv and *.xls files will be accepted)</em>
                    </div>
                </div>
            </section>
            <aside className='mt-4'>
                <h4 className='font-semibold'>Accepted file:</h4>
                <ul>{acceptedFileItems}</ul>
                <h4 className='font-semibold mt-8'>Rejected file:</h4>
                <ul>{fileRejectionItems}</ul>
            </aside>
            <div className='flex flex-col lg:flex-row justify-end mt-8'>
                <Button
                    onClick={() => uploadExcel(acceptedFiles)}
                    type="confirm"
                    text="Upload"
                    py="2"
                    px="3"
                />
            </div>
        </>
    )

}
