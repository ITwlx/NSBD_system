export default function (response){
  // 如果为空，直接返回
  if (!response.data) {
    return
  }
  // 获取响应头中的文件名
  let index=response.headers['content-disposition'].indexOf('=')
  let filename=response.headers['content-disposition'].slice(index+1)
  // 防止中文乱码
  filename=decodeURI(filename)
  // 下载
  let url = window.URL.createObjectURL(new Blob([response.data]))
  let link = document.createElement('a')
  link.style.display = 'none'
  link.href = url
  link.setAttribute('download', filename)

  document.body.appendChild(link)
  link.click()
}
