import { FC } from 'react'
import { Loading } from '@supabase/ui'

import { useProjectSubscription, useProjectUsage } from 'hooks'
import { formatBytes } from 'lib/helpers'
import { PRICING_TIER_PRODUCT_IDS, USAGE_APPROACHING_THRESHOLD } from 'lib/constants'
import SparkBar from 'components/ui/SparkBar'
import { usageBasedItems } from './ProjectUsageBars.constants'

interface ProjectUsageMinimalProps {
  projectRef?: string
  filter: string
}

const ProjectUsageMinimal: FC<ProjectUsageMinimalProps> = ({ projectRef, filter }) => {
  const { usage, error: usageError, isLoading } = useProjectUsage(projectRef)
  const { subscription, error: subscriptionError } = useProjectSubscription(projectRef)

  if (subscription?.tier?.supabase_prod_id === PRICING_TIER_PRODUCT_IDS.PAYG) {
    return <></>
  }

  const product = usageBasedItems.find((item) => item.title === filter)
  if (!product) return <></>

  if (usageError || subscriptionError) {
    return <div></div>
  }

  return (
    <Loading active={isLoading}>
      {usage && (
        <div className="space-y-8">
          {product.features.map((feature) => {
            const featureUsage = usage[feature.key]
            const usageRatio = featureUsage.usage / featureUsage.limit
            const isApproaching = usageRatio >= USAGE_APPROACHING_THRESHOLD
            const isExceeded = usageRatio >= 1

            return (
              <div key={feature.key} className="space-y-1">
                <h5 className="text-scale-1200 text-sm">{feature.title}</h5>
                <SparkBar
                  type="horizontal"
                  barClass={`${
                    isExceeded ? 'bg-red-900' : isApproaching ? 'bg-yellow-900' : 'bg-brand-900'
                  }`}
                  value={featureUsage.usage}
                  max={featureUsage.limit}
                  labelBottom={formatBytes(featureUsage.usage)}
                  labelTop={formatBytes(featureUsage.limit)}
                />
              </div>
            )
          })}
        </div>
      )}
    </Loading>
  )
}

export default ProjectUsageMinimal
