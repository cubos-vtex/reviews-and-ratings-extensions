import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-apollo'
import { FormattedMessage } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { useProduct } from 'vtex.product-context'
import { Link, canUseDOM } from 'vtex.render-runtime'
import { ReviewForm } from 'vtex.reviews-and-ratings'
import { Collapsible } from 'vtex.styleguide'

import ReviewsSettingsQuery from '../graphql/appSettings.graphql'
import ReviewsByProductIdQuery from '../graphql/reviewsByProductId.graphql'

type Props = {
  Then?: React.FC<unknown>
  Else?: React.FC<unknown>
}

type ReviewsSettings = {
  allowAnonymousReviews: boolean
  requireApproval: boolean
  useLocation: boolean
  defaultOpen: boolean
  defaultOpenCount: number
  showGraph: boolean
}

type ReviewsSettingsData = {
  appSettings: ReviewsSettings
}

type ReviewsData = {
  reviewsByProductId: {
    range: {
      total: number
    }
  }
}

declare global {
  interface Window {
    __RENDER_8_SESSION__: RenderSession
  }

  type RenderSession = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sessionPromise: Promise<any>
  }
}

declare let global: {
  __hostname__: string
  __pathname__: string
}

const HasReviewsCondition = ({ Then, Else }: Props) => {
  const handles = useCssHandles([
    'writeReviewContainer',
    'writeReviewButton',
    'loginLink',
  ])

  const [formOpen, setFormOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const productContext = useProduct()
  const productId = productContext?.product?.productId

  const { data: reviewsSettingsData } = useQuery<ReviewsSettingsData>(
    ReviewsSettingsQuery
  )

  const { data: reviewsData } = useQuery<ReviewsData>(ReviewsByProductIdQuery, {
    variables: { productId },
    skip: !productId,
  })

  const allowAnonymousReviews =
    reviewsSettingsData?.appSettings.allowAnonymousReviews

  const getLocation = () =>
    canUseDOM
      ? {
          url: window.location.pathname + window.location.hash,
          pathName: window.location.pathname,
        }
      : { url: global.__pathname__, pathName: global.__pathname__ }

  const { url } = getLocation()

  useEffect(() => {
    window.__RENDER_8_SESSION__.sessionPromise.then((sessionData) => {
      setIsAuthenticated(
        sessionData?.response?.namespaces?.authentication?.storeUserId?.value
      )
    })
  }, [setIsAuthenticated])

  if (reviewsData?.reviewsByProductId.range.total) {
    return !!Then && <Then />
  }

  return Else ? (
    <Else />
  ) : (
    <div className={handles.writeReviewContainer}>
      {allowAnonymousReviews || (!allowAnonymousReviews && isAuthenticated) ? (
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
      ) : (
        <Link
          page="store.login"
          query={`returnUrl=${encodeURIComponent(url)}`}
          className={`${handles.loginLink} h1 w2 tc flex items-center w-100-s h-100-s pa4-s`}
        >
          <FormattedMessage id="store/reviews.list.login" />
        </Link>
      )}
    </div>
  )
}

export default HasReviewsCondition
