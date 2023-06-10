/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import * as React from 'react'

import spinner from './images/loader.svg';
import { useFirebase } from './providers/firebase/FirebaseProvider';

export default function Category() {
    const {createDocument, currentUser, getDocument} = useFirebase()
    const [isLoading, setIsLoading] = React.useState(false)
    const [title, setTitle] = React.useState('')
    const [order, setOrder] = React.useState('0')



      const handleSubmit = (e) => {
        e.preventDefault()
        const normalizedData = {
            is_featured: false,
            order,
            title
        }
        setIsLoading(true)
            createDocument(normalizedData, {
                collectionName: 'categories'
            }).catch(()=>{}).finally(() => {
                setIsLoading(false)
            })


      }



      if (!currentUser ) {
        return (<div style={{
            display:'flex',
            justifyContent:'center',
            margin: 20,
        }}><img src={spinner} /></div>)
      }





  return (
    <form onSubmit={handleSubmit} className="lesson-fields-container" onInvalidCapture={(e) => console.log('res',e)} style={{marginBottom: 32}}>
          <div className="row">
          <div className="input-field col s11">
          <h4>Dars bo'limini yaratish</h4>
        </div>

        <div className="input-field col s1">
        <button className="btn waves-effect waves-light" type="submit" name="action">{isLoading ? 'Saqlanmoqda...': 'Saqlash'}</button>
        </div>
          </div>
      <div className="row">
      <div className="input-field col s6">
          <input required={true} type="text" value={title||''} className="validate" onChange={(e) => setTitle(e.target.value)} />
          <label >Sarlavha</label>
        </div>
        <div className="input-field col s6">
          <input required={true} type="number" value={order||''} className="validate" onChange={(e) => setOrder(e.target.value)} />
          <label >Tartib raqami</label>
        </div>

      </div>
    </form>
  )
}
