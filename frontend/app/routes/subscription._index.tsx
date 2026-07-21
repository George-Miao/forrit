import PageHeader from 'app/components/page_header'
import Button from 'app/ui/button'
import Icon from 'app/ui/icon'
import WidthLimit from 'app/components/width_limit'

export default function Subscription() {
  return (
    <>
      <PageHeader routes={[{ href: '/', name: '首页' }, { name: '订阅' }]}>
        <h1 className="mb-8 mt-16 text-4xl font-600 text-[rgb(28_31_35/80%)]">
          订阅
        </h1>
      </PageHeader>
      <WidthLimit>
        <Button
          aria-label="添加订阅"
          className="mt-4 h-25 w-full border-2 border-dashed border-edge"
          onClick={() => alert('NOT IMPLEMENTED')}
          variant="ghost"
        >
          <Icon className="text-2xl" name="plus" />
        </Button>
      </WidthLimit>
    </>
  )
}
