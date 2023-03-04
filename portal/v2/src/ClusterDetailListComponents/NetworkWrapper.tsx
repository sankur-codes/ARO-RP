import { IMessageBarStyles, MessageBar, MessageBarType, Stack } from "@fluentui/react"
import { AxiosResponse } from "axios"
import { useEffect, useRef, useState } from "react"
import { ICluster } from "../App"
import { networkKey } from "../ClusterDetail"
import { FetchNetwork } from "../Request"
import { ClusterNetworksListComponent } from "./ClusterNetworkList"
import { IngressProfilesListComponent } from "./IngressProfileList"
import { SubnetsListComponent } from "./SubnetList"
import { VNetPeeringsListComponent } from "./VNetPeeringList"

export interface IVNetPeering {
    name: string
    remotevnet: string
    state: string
    provisioning: string
}

export interface ISubnet {
    name: string
    addressprefix: string
    provisioning: string
    routetable: string
    id: string
}

export interface IIngressProfile {
    name: string
    ip: string
    visibility: string
}

export interface IClusterNetworkEntry {
    cidr: string
    hostsubnetlength: string
}

export interface IClusterNetwork {
    name: string
    pluginname: string
    networkcidr: string
    servicenetworkcidr: string
    hostsubnetlength: string
    mtu: string
    vxlanport: string
    clusternerworkentry?: IClusterNetworkEntry[]
}

export function NetworkWrapper(props: {
    currentCluster: ICluster
    detailPanelSelected: string
    loaded: boolean
}) {
    const [data, setData] = useState<any>([])
    const [error, setError] = useState<AxiosResponse | null>(null)
    const subnetState = useRef<SubnetsListComponent>(null)
    const vNetPeeringState = useRef<VNetPeeringsListComponent>(null)
    const ingressProfileState = useRef<IngressProfilesListComponent>(null)
    const clusterNetworkState = useRef<ClusterNetworksListComponent>(null)
  
    const [fetching, setFetching] = useState("")

    const errorBarStyles: Partial<IMessageBarStyles> = { root: { marginBottom: 15 } }

    const errorBar = (): any => {
        return (
        <MessageBar
            messageBarType={MessageBarType.error}
            isMultiline={false}
            onDismiss={() => setError(null)}
            dismissButtonAriaLabel="Close"
            styles={errorBarStyles}
        >
            {error?.statusText}
        </MessageBar>
        )
    }

    const updateData = (newData: any) => {
        setData(newData)
        const subnetList: ISubnet[] = []
        if (subnetState && subnetState.current) {
        newData.subnets.forEach((element: { name: string;
                                            addressprefix: string;
                                            provisioning: string;
                                            routetable: string;
                                            id: string;}) => {
            const subnet: ISubnet = {
                name: element.name,
                addressprefix: element.addressprefix,
                provisioning: element.provisioning,
                routetable: element.routetable,
                id: element.id
            }
            subnetList.push(subnet)
        });
            subnetState.current.setState({ subnets: subnetList })
        }

        const vNetPeeringList: IVNetPeering[] = []
        if (vNetPeeringState && vNetPeeringState.current) {
            newData.vnetpeerings.forEach((element: { name: string;
                                                remotevnet: string;
                                                state: string;
                                                provisioning: string;}) => {
                const vNetPeering: IVNetPeering = {
                    name: element.name,
                    remotevnet: element.remotevnet,
                    state: element.state,
                    provisioning: element.provisioning
                }
                vNetPeeringList.push(vNetPeering)
            });
            vNetPeeringState.current.setState({ vNetPeerings: vNetPeeringList })
        }

        const ingressProfileList: IIngressProfile[] = []
        if (ingressProfileState && ingressProfileState.current) {
            newData.ingressprofiles.forEach((element: { name: string;
                                                ip: string;
                                                visibility: string;}) => {
                const ingressProfile: IIngressProfile = {
                    name: element.name,
                    ip: element.ip,
                    visibility: element.visibility
                }
                ingressProfileList.push(ingressProfile)
            });
            ingressProfileState.current.setState({ ingressProfiles: ingressProfileList })
        }

        const clusterNetworkList: IClusterNetwork[] = []
        if (clusterNetworkState && clusterNetworkState.current) {
            newData.clusternetworks.forEach((element: { name: string;
                                                    pluginname: string;
                                                    networkcidr: string;
                                                    servicenetworkcidr: string;
                                                    hostsubnetlength: string;
                                                    mtu: string;
                                                    vxlanport: string;
                                                    clusternetworkentry: IClusterNetworkEntry[]}) => {
                const clusterNetwork: IClusterNetwork = {
                    name: element.name,
                    pluginname: element.pluginname,
                    networkcidr: element.networkcidr,
                    servicenetworkcidr: element.servicenetworkcidr,
                    hostsubnetlength: element.hostsubnetlength,
                    mtu: element.mtu,
                    vxlanport: element.vxlanport,
                }

                clusterNetwork.clusternerworkentry = []
                element.clusternetworkentry.forEach((clusternetworkentry: IClusterNetworkEntry) => {
                    clusterNetwork.clusternerworkentry!.push(clusternetworkentry)
                })

                clusterNetworkList.push(clusterNetwork)
            })

            clusterNetworkState.current.setState({clusterNetworks: clusterNetworkList})
        }

    }

    useEffect(() => {
        const onData = (result: AxiosResponse | null) => {
          if (result?.status === 200) {
            updateData(result.data)
          } else {
            setError(result)
          }
          setFetching(props.currentCluster.name)
        }
    
        if (props.detailPanelSelected.toLowerCase() == networkKey && 
            fetching === "" &&
            props.loaded &&
            props.currentCluster.name != "") {
          setFetching("FETCHING")
          FetchNetwork(props.currentCluster).then(onData)
        }
    }, [data, props.loaded, props.detailPanelSelected])

    return (
        <Stack>
          <Stack.Item grow>{error && errorBar()}</Stack.Item>
          <Stack>
            <h3><u>Cluster Network</u></h3>
            <ClusterNetworksListComponent clusterNetworks={data!} ref={clusterNetworkState} clusterName={props.currentCluster != null ? props.currentCluster.name : ""} />
          </Stack>
          <Stack>
            <h3><u>Subnet</u></h3>
            <SubnetsListComponent subnets={data!} ref={subnetState} clusterName={props.currentCluster != null ? props.currentCluster.name : ""} />
          </Stack>
          <Stack>
            <h3><u>VNetPeering</u></h3>
            <VNetPeeringsListComponent vNetPeerings={data!} ref={vNetPeeringState} clusterName={props.currentCluster != null ? props.currentCluster.name : ""} />
          </Stack>
          <Stack>
            <h3><u>Ingress Profile</u></h3>
            <IngressProfilesListComponent ingressProfiles={data!} ref={ingressProfileState} clusterName={props.currentCluster != null ? props.currentCluster.name : ""} />
          </Stack>
        </Stack>   
      )
}