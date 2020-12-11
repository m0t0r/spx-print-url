import * as React from 'react';
import Head from 'next/head';
import { useClipboard } from 'use-clipboard-copy';

const initalURL = 'https://localhost:9002/s/print/dvr/:zoneId/:containerId?';

export default function Home() {
  const clipboard = useClipboard({ copiedTimeout: 2500 });
  const [url, setUrl] = React.useState(initalURL);
  const [env, setEnv] = React.useState('remote');
  const [mode, setMode] = React.useState('standalone');
  const [queryParams, setQueryParams] = React.useState('');

  function handleOnChangeEnv(event) {
    const prevValue = env;
    const value = event.target.value;
    setUrl(url.replace(getEnv(prevValue), getEnv(value)));
    setEnv(value);
  }

  function handleOnChangeMode(event) {
    const prevValue = mode;
    const value = event.target.value;
    setUrl(url.replace(getMode(prevValue), getMode(value)));
    setMode(value);
  }

  function handleOnChangeQueryParams(event) {
    const value = event.target.value;
    setQueryParams(value);

    if (!value.length) {
      setUrl(initalURL);
      return;
    }
    const { zoneId, containerId, ...params } = parseQueryParams(value);
    setUrl(`${getEnv(env)}${getMode(mode)}print/dvr/${zoneId}/${containerId}?${formatQueryParams(params)}`);
  }

  function parseQueryParams(value) {
    return value.split('\n').reduce((obj, param) => {
      const [key, value, ...other] = param.split(':');

      if (value?.trim() === 'null') {
        return obj;
      }

      return {
        ...obj,
        [key]:
          key.toLowerCase().includes('time') && !key.toLowerCase().includes('isrealtime')
            ? `${value?.trim()}:${other.join(':')}`.replace(/['"]+/g, '')
            : value?.trim().replace(/['"]+/g, ''),
      };
    }, {});
  }

  function getEnv(value) {
    return value === 'remote' ? 'https://localhost:9002' : 'http://localhost:4200';
  }

  function getMode(value) {
    return `/${value === 'standalone' ? 's' : 'i'}/`;
  }

  function formatQueryParams(params) {
    return Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join('&');
  }

  const copyUrl = React.useCallback(() => {
    clipboard.copy(url);
  }, [clipboard.copy, url]);

  function clear() {
    setEnv('remote');
    setMode('standalone');
    setQueryParams('');
    setUrl(initalURL);
  }

  return (
    <div className='flex max-w-screen-md min-h-screen m-auto'>
      <Head>
        <title>SPX Print URL</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className='w-full mt-48'>
        <h1 className='text-4xl font-semibold text-center text-gray-800'>SPX Print URL</h1>
        <input className='w-full px-2 py-1 mt-4 rounded-lg text-gray-600 border-2 border-gray-300' type='text' readOnly value={url} />
        <div className='mt-3'>
          <div className='flex justify-center'>
            <div className='rounded-md shadow'>
              <button
                type='button'
                className='flex items-center justify-center px-8 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:text-lg'
                onClick={copyUrl}
              >
                {clipboard.copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <button
              type='button'
              className='flex items-center justify-center px-8 py-2 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:text-lg ml-3'
              onClick={clear}
            >
              Clear
            </button>
          </div>
        </div>
        <form className='flex mt-5'>
          <div className='flex-auto text-gray-800'>
            <p className='text-lg font-semibold'>Environment</p>
            <div className='flex'>
              <div>
                <input type='radio' id='remote' name='environment' checked={env === 'remote'} value='remote' onChange={handleOnChangeEnv} />
                <label className='ml-2' htmlFor='remote'>
                  Remote
                </label>
              </div>

              <div className='ml-3'>
                <input type='radio' id='local' name='environment' checked={env === 'local'} value='local' onChange={handleOnChangeEnv} />
                <label className='ml-2' htmlFor='local'>
                  Local
                </label>
              </div>
            </div>
          </div>
          <div className='flex-auto text-gray-800'>
            <p className=' text-lg font-semibold'>SPX mode</p>
            <div className='flex'>
              <div>
                <input
                  type='radio'
                  id='standalone'
                  name='spxmode'
                  checked={mode === 'standalone'}
                  value='standalone'
                  onChange={handleOnChangeMode}
                />
                <label className='ml-2' htmlFor='standalone'>
                  Standalone
                </label>
              </div>

              <div className='ml-3'>
                <input
                  type='radio'
                  id='integrated'
                  name='spxmode'
                  checked={mode === 'integrated'}
                  value='integrated'
                  onChange={handleOnChangeMode}
                />
                <label className='ml-2' htmlFor='integrated'>
                  Integrated
                </label>
              </div>
            </div>
          </div>
        </form>
        <div className='mt-10'>
          <p className='text-gray-600'>Paste request payload (no need to format as valid JSON)</p>

          <div className=''>
            <textarea
              placeholder={`chartPage: 0\ncontainerId: "1c61a4f0-6328-4367-a5da-08aa22c4f326"\nendTime: "2020-12-10T02:40:24.559Z"\nisRealTime: true\nlang: "en"\nmetricsTime: "2020-12-10T02:40:12Z"\npositionSide: "right"\nstartTime: "2020-12-10T02:35:42Z"\nzoneId: "SZ0"`}
              rows={10}
              className='border-gray-400 border-2 rounded-md w-full mt-3'
              value={queryParams}
              onChange={handleOnChangeQueryParams}
            ></textarea>
          </div>
        </div>
      </main>
    </div>
  );
}
