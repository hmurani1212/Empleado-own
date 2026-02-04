import React from 'react'
import { Card, CardBody, Typography } from '@material-tailwind/react'
import { FaClock } from 'react-icons/fa'

const RecentActivities = ({ activities }) => {
  return (
    <Card className="rounded-lg drop-shadow">
      <CardBody className="p-4">
        <Typography className="text-[16px] font-semibold text-[#474747] mb-4">
          Recent Activities
        </Typography>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Typography className="text-[14px] text-gray-600">
              No recent activities
            </Typography>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaClock className="text-gray-500 text-[14px]" />
                <div className="flex-1">
                  <Typography className="text-[13px] text-[#474747]">
                    {activity.message || activity.description || 'Activity'}
                  </Typography>
                  <Typography className="text-[11px] text-gray-500 mt-1">
                    {activity.date || activity.createdAt ? new Date((activity.date || activity.createdAt) * 1000).toLocaleString() : 'N/A'}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default RecentActivities

