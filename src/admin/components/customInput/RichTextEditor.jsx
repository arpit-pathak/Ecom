import Editor from 'ckeditor5-custom-build/build/ckeditor';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { AdminApis } from '../../utils';
import useAuth from '../../hooks/UseAuth';

const RichTextEditor = ({ data, onEditorInstance, disabled }) => {
    const auth = useAuth();

    const editorConfig = {
        htmlSupport: {
            allow: [
                {
                    name: /.*/,
                    attributes: true,
                    classes: true,
                    styles: true
                }
            ]
        },
        fontFamily: {
            options: [
                'Poppins',
            ]
        },
        fontSize: {
            options: [9, 10, 11, 12, 13, 14, 16, 21, 35],
            supportAllValues: true
        },
        simpleUpload:{
            // The URL that the images are uploaded to.
            uploadUrl: AdminApis.imageUpload,
            // Headers sent along with the XMLHttpRequest to the upload server.
            headers: {
                Authorization: `Bearer ${auth.token.access}`
            }
        },
    };

    return (
        <CKEditor
            editor={Editor}
            data={data}
            disabled={disabled ?? false}
            onReady={editor => {
                // You can store the "editor" and use when it is needed.
                onEditorInstance(editor);
            }}
            config={editorConfig}
        />
    )
}

export default RichTextEditor;