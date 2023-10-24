import React from 'react'
import { useQuery } from 'react-apollo'
import { useCssHandles } from 'vtex.css-handles'
import { useProduct } from 'vtex.product-context'

import AverageRatingByProductId from '../graphql/averageRatingByProductId.graphql'
import Skeleton from './Skeleton'

interface AverageData {
  averageRatingByProductId: {
    average: number
    starsFive: number
    starsFour: number
    starsThree: number
    starsTwo: number
    starsOne: number
    total: number
  }
}

const AverageRating = () => {
  const handles = useCssHandles([
    'averageRatingLoadingContainer',
    'averageRatingContainer',
  ])

  const productContext = useProduct()
  const productId = productContext?.product?.productId

  const { data, loading } = useQuery<AverageData>(AverageRatingByProductId, {
    variables: {
      productId,
    },
    skip: !productId,
    fetchPolicy: 'network-only',
    ssr: false,
  })

  if (loading) {
    return (
      <div className={handles.averageRatingLoadingContainer}>
        <Skeleton height="100%" />
      </div>
    )
  }

  const average = data?.averageRatingByProductId.average ?? 0

  return <div className={handles.averageRatingContainer}>{average}/5</div>
}

export default AverageRating
