import React, {useEffect, useState} from 'react';
import {shuffle} from 'lodash'
import './App.css';

const App = () => {
    const [storiesData, setStoriesData] = useState([])
    const [loading, setLoading] = useState(true)

    const getStoriesIds = async () => {
        return await fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
    };
    const getNewsWithAuthor = async (id) => new Promise(async (resolve, reject) => {
        try{
            const news = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
            news.json()
                .then(async ({by:authorID, title, score, url})=>{
                    const author = await fetch(`https://hacker-news.firebaseio.com/v0/user/${authorID}.json`);
                    author.json()
                        .then(({karma: authorKarma})=>resolve({authorID, authorKarma, title, score, url}))
            })
        }catch(e){
            reject('Can not fetch ether news or author info')
        }

    });

    useEffect(()=>{
        getStoriesIds()
            .then(response => response.json())
            .then(ids=>{
                // here we've got 10 random ids
                const topTenIds = shuffle(ids).slice(0, 10);
                const newsPromises = topTenIds.map(id => getNewsWithAuthor(id))
                Promise.all(newsPromises).then(stories => {
                    //once we've got info for ALL news put them into the state
                    setStoriesData(stories.sort((a,b)=>a.score-b.score));
                    setLoading(false)
                }).catch(e => console.log(e));

            }).catch(e=>console.log('Some error occurred: ', e));
    },[]);

  return (
    <div className="main">
        {loading && <div className="loading">Loading...</div>}
        {storiesData.length>0 && <>
            <ul className="stories">
                {storiesData.map(({title, url, score, authorKarma, authorID }, key) => (
                    <li className="story-item" key={key}>
                        <div className="title"><a href={url}>{title}</a></div>
                        <div className="props">
                            <div className="score">Score: {score}</div>
                            <div className="author">Author: {authorID} - {authorKarma}</div>
                        </div>
                    </li>
                ))}
            </ul>
        </>}

    </div>
  );
}

export default App;
