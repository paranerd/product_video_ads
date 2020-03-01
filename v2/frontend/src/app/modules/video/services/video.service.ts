import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { Video } from 'app/models/video'
import { CachedConfigurationRepository } from 'app/repositories/implementations/googleapi/cached-configuration.repository'
import { LoginService } from 'app/modules/login/services/login.service'
import { Config } from 'app/models/config'
import { Campaign } from 'app/models/campaign'

@Injectable({providedIn: 'root'})
export class VideoService {

    private readonly _videos = new BehaviorSubject<Video[]>([])
    
    /** Published state to application **/
    readonly videos$ = this._videos.asObservable()

    get videos() {
        return [...this._videos.getValue()]
    }

    constructor(private repository : CachedConfigurationRepository, loginService : LoginService) {
        loginService.ready$.subscribe(async ready => {
            if (ready == 1)
                this._videos.next(await this.repository.load_videos())
            
        })
    }

    add_preview_video(configs : Array<Config>, base : string) {
        return this.add_video(configs, base, 'Preview')
    }

    add_production_video(configs : Array<Config>, base : string, campaign : Campaign) {
        return this.add_video(configs, base, 'On', campaign)
    }

    private add_video(configs : Array<Config>, base : string, status : string, campaign? : Campaign) {
        this._videos.next([...this.videos, new Video(configs, base, status, campaign)])
        return this.repository.save_videos(this.videos)
    }

    async update_videos() {
        this._videos.next(await this.repository.load_videos())
    }

    delete_video(generated_video : string) {
        this._videos.next(this.videos.filter(v => v.generated_video != generated_video))
        return this.repository.save_videos(this.videos)
    }
}