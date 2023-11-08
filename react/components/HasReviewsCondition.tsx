import React, { useState } from 'react'
import { useQuery } from 'react-apollo'
import { FormattedMessage } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { useProduct } from 'vtex.product-context'
import { ReviewForm } from 'vtex.reviews-and-ratings'
import { Collapsible } from 'vtex.styleguide'

import ReviewsByProductId from '../graphql/reviewsByProductId.graphql'

type Props = {
  Then?: React.FC<unknown>
  Else?: React.FC<unknown>
}

type ReviewsData = {
  reviewsByProductId: {
    range: {
      total: number
    }
  }
}

const HasReviewsCondition = ({ Then, Else }: Props) => {
  const handles = useCssHandles(['writeReviewButton'])
  const [formOpen, setFormOpen] = useState(false)
  const productContext = useProduct()
  const productId = productContext?.product?.productId

  const { data } = useQuery<ReviewsData>(ReviewsByProductId, {
    variables: { productId },
    skip: !productId,
  })

  if (data?.reviewsByProductId.range.total) {
    return !!Then && <Then />
  }

  return Else ? (
    <Else />
  ) : (
    <Collapsible
      header={
        <span
          className={`${handles.writeReviewButton} c-action-primary hover-c-action-primary`}
        >
          <FormattedMessage id="store/reviews.list.writeReview" />
        </span>
      }
      onClick={() => setFormOpen((open) => !open)}
      isOpen={formOpen}
    >
      <ReviewForm refetchReviews={() => null} />
    </Collapsible>
  )
}

export default HasReviewsCondition
