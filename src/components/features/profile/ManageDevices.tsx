// !/usr/bin/env python
//
// All rights reserved.
//
// __author__ = "phamanhhuy22@gmail.com"
// __date__ = "2025-02-24 22:40:59"
//

import DeviceDetail from './DeviceDetail'

const ManageDevices = ({ currentDevice, otherDevices }: any) => {
    return <DeviceDetail device={currentDevice} is_active />
}

export default ManageDevices
