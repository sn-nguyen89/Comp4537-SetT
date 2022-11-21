import React from 'react'

function page({ currentPokemons, currentPage }) {
  return (
    <div>
      <h1>
        Page number {currentPage}
      </h1>
      <div className="grid">
      {
        currentPokemons.map(item => {
          return <div>  {item.name.english} id: {item.id} </div>
        })
      }
      </div>
    </div>
  )
}

export default page