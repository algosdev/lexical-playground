/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getRoot,
    $insertNodes,
  } from 'lexical';
import * as React from 'react'

import spinner from './images/loader.svg';
import { useFirebase } from './providers/firebase/FirebaseProvider';

export default function LessonFields() {
    const [editor] = useLexicalComposerContext();
    const {createDocument, currentUser, getDocument, updateDocument} = useFirebase()
    const [isLoading, setIsLoading] = React.useState(false)
    const [id] = React.useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    })
    const [data, setData] = React.useState({})
    const parseHTML = () => {
        let parsedHTML = ''
        editor.getEditorState().read(() => {
           parsedHTML = $generateHtmlFromNodes(editor, null);
        });
        return parsedHTML
      }
      const handleChange = e => setData(old => ({...old, [e.target.name]: e.target.value}))

      const handleSubmit = (e) => {
        e.preventDefault()
        const normalizedData = {
            ...data,
            content: parseHTML()
        }
        setIsLoading(true)
        if (id) {

            updateDocument(normalizedData, {
                collectionName:'lessons',
                id
            }).catch(()=>{}).finally(() => {
                setIsLoading(false)
            })
        } else {
            createDocument(normalizedData, {
                collectionName: 'lessons'
            }).catch(()=>{}).finally(() => {
                setIsLoading(false)
            })
        }
        console.log(normalizedData)


      }

      React.useEffect(() => {
        if (!currentUser) {
            return
        }
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        console.log('currentUser',currentUser, id, urlParams)
        if (id) {

        getDocument({collectionName: 'lessons', id}).then(res => {
            console.log('res',res)
            const {content, ...rest} = res
            setData(rest)
            editor.update(() => {
                const parser = new DOMParser();
                const dom = parser.parseFromString(content, 'text/html');

                // Once you have the DOM instance it's easy to generate LexicalNodes.
                const nodes = $generateNodesFromDOM(editor, dom);

                // Select the root
                $getRoot().select();

                // Insert them at a selection.
                $insertNodes(nodes);
              });
              setTimeout(() => window.scrollTo(0,0),200)
        })
    }
      }, [currentUser])

      if (!currentUser || (id && !data.title)) {
        return (<div style={{
            display:'flex',
            justifyContent:'center',
            margin: 20,
        }}><img src={spinner} /></div>)
      }



  return (
    <form onSubmit={handleSubmit} className="lesson-fields-container">
          <div className="row">
          <div className="input-field col s11">
          <h4>Darsni yaratish/o'zgartirish</h4>
        </div>
        <div className="input-field col s1">
        <button className="btn waves-effect waves-light" type="submit" name="action">{isLoading ? 'Saqlanmoqda...': 'Saqlash'}</button>
        </div>
          </div>
      <div className="row">
        <div className="input-field col s6">
          <input id="title" name="title" value={data.title||''} type="text" className="validate" onChange={handleChange} />
          <label htmlFor="title">Sarlavhasi</label>
        </div>
        <div className="input-field col s6">
          <input id="cover_img" name="cover_image" value={data.cover_image||''} type="text" className="validate" onChange={handleChange} />
          <label htmlFor="cover_img">Muqova uchun rasm</label>
        </div>
      </div>
      <div className="row">
        <div className="input-field col s6">
          <input id="duration" name="duration" type="text" value={data.duration||''} className="validate" onChange={handleChange} />
          <label htmlFor="duration">Davomiyligi (minut)</label>
        </div>
        <div className="input-field col s6">
          <input id="order" name="order" type="text" value={data.order||''} className="validate" onChange={handleChange} />
          <label htmlFor="order">Tartib raqami</label>
        </div>
      </div>
      <div className="row">
      <div className="input-field col s6">
      <select id="form-select-6" name="category_id" value={data.category_id||''} className="browser-default" onChange={handleChange}>
    <option value="" disabled={true} selected={true}>Bo'limni tanlang</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  </select>
  </div>
  <div className="input-field col s6">
      <select id="form-select-6" name="quiz_id" value={data.quiz_id||''} className="browser-default" onChange={handleChange}>
    <option value="" disabled={true} selected={true}>Sinov testini tanlang</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  </select>
  </div>
      </div>
    </form>
  )
}
