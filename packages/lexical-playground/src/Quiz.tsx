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

const Answer = ({onChange,data}) => {

  return (<div>
   <div className="row">
        <div className="input-field col s8">
          <input required={true} id="duration" name="duration" type="text" value={data.title||''} className="validate" onChange={(e) => onChange({title:e.target.value})} />
          <label htmlFor="duration">Javob matni</label>
        </div>
        <div className="input-field col s4">
        <div className="switch">
    <label>
      To'g'ri javobmi?
      <input type="checkbox" checked={data.is_correct} name="is_featured" onChange={(e) => onChange({
        is_correct: e.target.checked
      })} />
      <span className="lever" />
    </label>
  </div>
        </div>
      </div>
      </div>)
}
const Question = ({setQuestion, data, number}) => {
  const addAnswer = () => {
    setQuestion({answers: data.answers.concat([{
      is_correct: false,
      title: ''
    }])})
  }
  const handleAnswerChange = (partialData, index) => {
    setQuestion({answers: data.answers.map((a,i) => index ===i? {...a,...partialData}:a)})
  }

  return (<div style={{
    borderBottom: `1px solid var(--primary-color)`,
    marginBottom:10,
    paddingBottom: 30
  }}>
    <p>{number}-savol</p>
   <div className="row">
        <div className="input-field col s6">
          <input required={true} type="text" value={data.title||''} className="validate" onChange={(e) => setQuestion({title: e.target.value})} />
          <label >Savol matni</label>
        </div>
        <div className="input-field col s6">
          <input type="text" value={data.cover_image||''} className="validate" onChange={(e) => setQuestion({cover_image: e.target.value})} />
          <label >Savol uchun rasm</label>
        </div>


      </div>
        {data.answers.map((answer,index) => <Answer data={answer} key={index} onChange={(p) => handleAnswerChange(p, index)} />)}
        <div className="input-field col s2">
        <button onClick={addAnswer} className="btn waves-effect waves-light" type="button" >Javob qo'shish</button>
        </div>
    </div>)
}
const defaultQuestionData = {answers: [{
  is_correct: true,
  title: ''
}], title: ''}
export default function Quiz() {
    const {createDocument, currentUser, getDocument,getDocuments, updateDocument, getReference} = useFirebase()
    const [isLoading, setIsLoading] = React.useState(false)
    const [lessons, setLessons] = React.useState([])
    const [title, setTitle] = React.useState('')
    const [questions, setQuestions] = React.useState([
      {...defaultQuestionData}
    ])
    const [id] = React.useState(() => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    })
    const [lesson, setLesson] = React.useState()


      const handleSubmit = (e) => {
        e.preventDefault()
        const lessonData = lessons.find(el => el.id == lesson)
        const normalizedData = {
            cover_image: lessonData.cover_image,
            lesson: getReference({collectionName: 'lessons', id: lessonData.id}),
            lesson_title: lessonData.title,
            questions,
            title,
        }
        setIsLoading(true)
        if (id) {

            updateDocument(normalizedData, {
                collectionName:'quizzes',
                id
            }).catch(()=>{}).finally(() => {
                setIsLoading(false)
            })
        } else {
            createDocument(normalizedData, {
                collectionName: 'quizzes'
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
        if (id) {

        getDocument({collectionName: 'quizzes', id}).then(res => {
            console.log('res',res)
            const {lesson,questions,title} = res
            setLesson(lesson.id)
            setTitle(title)
            setQuestions(questions)
        })

    }
    getDocuments({collectionName: 'lessons'}).then(res => {
      console.log('lessons',res)
      setLessons(res)
    })

      }, [currentUser])

      const addQuestion = () => {
        setQuestions((old) => old.concat([{...defaultQuestionData}]))
      }


      if (!currentUser || (id && !lesson)) {
        return (<div style={{
            display:'flex',
            justifyContent:'center',
            margin: 20,
        }}><img src={spinner} /></div>)
      }





  return (
    <form onSubmit={handleSubmit} className="lesson-fields-container" style={{marginBottom: 32}}>
          <div className="row">
          <div className="input-field col s11">
          <h4>Sinov testini yaratish</h4>
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
      <select required={true} id="form-select-6" name="lesson" value={lesson||''} className="browser-default" onChange={(e) => setLesson(e.target.value)}>
    <option value="" disabled={true} selected={true}>Darsni tanlang</option>
    {lessons.map((lesson) => <option value={lesson.id} key={lesson.id}>{lesson.title}</option>)}
  </select>
  </div>

      </div>
      {questions.map((question, index) => <Question key={index} data={question} number={index+1} setQuestion={(partialData) => setQuestions(old => old.map((q,i) => index === i ? ({...q, ...partialData}): q))} />)}

      <button onClick={addQuestion} className="btn waves-effect waves-light" type="button" >Savol qo'shish</button>
    </form>
  )
}
