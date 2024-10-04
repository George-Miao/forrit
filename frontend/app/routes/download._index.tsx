import { List } from '@douyinfe/semi-ui'
import Text from '@douyinfe/semi-ui/lib/es/typography/text'
import Title from '@douyinfe/semi-ui/lib/es/typography/title'
import { useDownloadList } from 'app/client'
import DownloadItem from 'app/components/download_list'
import LoadingInfinite from 'app/components/loading_infinite'
import PageHeader from 'app/components/page_header'
import WidthLimit from 'app/components/width_limit'

export default function Download() {
  return (
    <>
      <PageHeader routes={[{ href: '/', name: '首页' }, { name: '下载' }]}>
        <Title type='secondary' style={{ margin: '2em 0 1em' }}>
          下载
        </Title>
      </PageHeader>
      <WidthLimit>
        <List
          style={{ width: '100%' }}
          emptyContent={
            <Text
              type='tertiary'
              style={{
                display: 'block',
                marginTop: '2em',
              }}
            >
              暂无下载
            </Text>
          }
        >
          <LoadingInfinite data={useDownloadList()}>
            {data => (
              <>
                {data.map(item => (
                  <DownloadItem key={item._id.$oid} item={item} />
                ))}
              </>
            )}
          </LoadingInfinite>
        </List>
      </WidthLimit>
    </>
  )
}
