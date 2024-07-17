const _ = require('lodash')
// eslint-disable-next-line no-unused-vars
const dummy=(blogs)=> {
    return 1
}

const totalLikes=(blogs)=>{
    
    if (blogs.length===0){return 0}
    else {
        const arr=blogs.map(blog=>blog.likes)
        const sum=arr.reduce((accumulator,currentValue)=> {
            return accumulator+currentValue
        })
        return sum 
    }
}

const favoriteBlog=(blogs)=>{

    const mostFavorite=blogs.reduce((previousValue, currentValue)=>{   
        return (previousValue.likes > currentValue.likes) ? previousValue : currentValue   
    })
    return {title: mostFavorite.title, author: mostFavorite.author, likes: mostFavorite.likes}
}

const mostBlogs=(blogs)=>{
    const authorsCount={}

    blogs.forEach((blog)=>{
        if (authorsCount[blog.author]) {
            authorsCount[blog.author]++
        }
        else {
            authorsCount[blog.author]=1
        }    
    })
    const mostBlogAuthorName =_.maxBy(_.keys(authorsCount), (authorName) => {
        return authorsCount[authorName]
    })

    return {author: mostBlogAuthorName,blogs:authorsCount[mostBlogAuthorName]}
}


const mostLikes=(blogs)=>{
    const authorsCount={}

    blogs.forEach((blog)=>{
        if (authorsCount[blog.author]) {
            authorsCount[blog.author] += blog.likes
        } else {
            authorsCount[blog.author] = blog.likes
        }
         
    })
    const mostBlogAuthorName =_.maxBy(_.keys(authorsCount), (authorName) => {
        return authorsCount[authorName]
    })

    return {author: mostBlogAuthorName,likes:authorsCount[mostBlogAuthorName]}
}

module.exports={
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}
